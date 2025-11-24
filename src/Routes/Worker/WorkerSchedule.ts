// routes/schedule.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import dayjs from "dayjs";

const prisma = new PrismaClient();
const schedule = Router();

// helper: parse "HH:mm" -> Date anchored to 1970-01-01 or null
function parseTimeOrNull(t?: string | null) {
  if (!t) return null;
  if (!/^\d{2}:\d{2}$/.test(t)) return null;
  return new Date(`1970-01-01T${t}:00`);
}

// GET /schedule/weekly
// Returns the worker's week schedule (single row)
schedule.get("/WorkerSchedule/weekly", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const schedule = await prisma.weekSchedule.findUnique({
      where: { workerId: workerId }
    });
    return res.json({ schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /schedule/weekly
// Body: JSON with Start_* and End_* keys as "HH:mm" or null for each day
schedule.post("/WorkerSchedule/weekly", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const body = req.body || {};

    const fields = [
      "Start_Sunday","End_Sunday","Start_Monday","End_Monday","Start_Tuesday","End_Tuesday",
      "Start_Wednesday","End_Wednesday","Start_Thursday","End_Thursday","Start_Friday","End_Friday",
      "Start_Saturday","End_Saturday"
    ];

    // Validate HH:mm or null
    for (const f of fields) {
      const v = body[f];
      if (v !== undefined && v !== null && !/^\d{2}:\d{2}$/.test(v)) {
        return res.status(400).json({ message: `Invalid time format for ${f}. Use HH:mm.` });
      }
    }

    // Validate Start + End pairs
    const dayPairs = [
      ["Start_Sunday","End_Sunday"],
      ["Start_Monday","End_Monday"],
      ["Start_Tuesday","End_Tuesday"],
      ["Start_Wednesday","End_Wednesday"],
      ["Start_Thursday","End_Thursday"],
      ["Start_Friday","End_Friday"],
      ["Start_Saturday","End_Saturday"]
    ];

    for (const [startKey, endKey] of dayPairs) {
      const s = body[startKey];
      const e = body[endKey];

      // One missing → ERROR
      if ((s && !e) || (!s && e)) {
        return res.status(400).json({
          message: `${startKey} and ${endKey} must be provided together`
        });
      }

      // If both exist, validate order
      if (s && e) {
        const sDate = parseTimeOrNull(s);
        const eDate = parseTimeOrNull(e);

        if (!sDate || !eDate) {
          return res.status(400).json({ message: `Invalid time for ${startKey}/${endKey}` });
        }

        if (sDate >= eDate) {
          return res.status(400).json({
            message: `${startKey} must be earlier than ${endKey}`
          });
        }
      }
    }

    // Build save object
    const dataToSave: any = {};
    for (const f of fields) {
      if (body[f] !== undefined) {
        dataToSave[f] = body[f] ? parseTimeOrNull(body[f]) : null;
      }
    }

    // Check if schedule exists
    const existing = await prisma.weekSchedule.findUnique({
      where: { workerId }
    });

    let result;

    if (existing) {
      // Update only the provided fields
      result = await prisma.weekSchedule.update({
        where: { workerId },
        data: dataToSave
      });
    } else {
      // Create — only relation + time fields allowed
      result = await prisma.weekSchedule.create({
        data: {
          worker: { connect: { id: workerId } }, // Prisma sets workerId automatically
          ...dataToSave
        }
      });
    }

    return res.json({
      message: "Weekly schedule saved successfully",
      schedule: result
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
});



// GET /schedule/month?month=YYYY-MM
// Returns all holiday entries for the month ONLY (no orders)
schedule.get("/WorkerSchedule/month", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const month = String(req.query.month || "");

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month is required in YYYY-MM format" });
    }

    const start = dayjs(`${month}-01`).startOf("month").toDate();
    const end = dayjs(`${month}-01`).endOf("month").toDate();

    const holidays = await prisma.monthSchedule.findMany({
      where: { workerId: workerId, date: { gte: start, lte: end } },
      orderBy: { date: "asc" }
    });

    return res.json({ month, holidays });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// POST /schedule/month
schedule.post("/WorkerSchedule/month", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const { date, note } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date is required in YYYY-MM-DD" });
    }

    const parsed = dayjs(date).startOf("day").toDate();

    const exists = await prisma.monthSchedule.findFirst({
      where: { workerId: workerId, date: parsed }
    });

    if (exists) {
      return res.status(400).json({ message: "Holiday already added for this date" });
    }

    const created = await prisma.monthSchedule.create({
      data: {
        worker: { connect: { id: workerId } },
        date: parsed,
        note: note ?? null
      }
    });

    return res.status(201).json({
      message: "Holiday added",
      holiday: created
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


schedule.delete("/WorkerSchedule/month", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const date = String(req.query.date);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Date must be YYYY-MM-DD" });
    }

    const parsed = new Date(date);

    const entry = await prisma.monthSchedule.findFirst({
      where: { workerId: workerId, date: parsed }
    });

    if (!entry) {
      return res.status(404).json({ message: "No holiday found for this date" });
    }

    await prisma.monthSchedule.delete({
      where: { id: entry.id }
    });

    return res.json({ message: "Holiday removed successfully", deletedDate: date });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default schedule;
