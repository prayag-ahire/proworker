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
schedule.get("/weekly", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const schedule = await prisma.week_Schedule.findUnique({
      where: { Worker_Id: workerId }
    });
    return res.json({ schedule });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// PUT /schedule/weekly
// Body: JSON with Start_* and End_* keys as "HH:mm" or null for each day
schedule.put("/weekly", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const body = req.body || {};

    // fields expected
    const fields = [
      "Start_Sunday","End_Sunday","Start_Monday","End_Monday","Start_Tuesday","End_Tuesday",
      "Start_wednesday","End_wednesday","Start_thursday","End_thursday","Start_friday","End_friday",
      "Start_saturday","End_saturday"
    ];

    // validate basic format
    for (const f of fields) {
      const v = body[f];
      if (v !== undefined && v !== null && !/^\d{2}:\d{2}$/.test(v)) {
        return res.status(400).json({ message: `Invalid time format for ${f}. Use HH:mm or null.` });
      }
    }

    // ensure start < end when both provided
    const dayPairs = [
      ["Start_Sunday","End_Sunday"],
      ["Start_Monday","End_Monday"],
      ["Start_Tuesday","End_Tuesday"],
      ["Start_wednesday","End_wednesday"],
      ["Start_thursday","End_thursday"],
      ["Start_friday","End_friday"],
      ["Start_saturday","End_saturday"]
    ];

    for (const [sKey, eKey] of dayPairs) {
      const s = body[sKey], e = body[eKey];
      if (s && e) {
        const sDate = parseTimeOrNull(s), eDate = parseTimeOrNull(e);
        if (!sDate || !eDate) return res.status(400).json({ message: `Invalid times for ${sKey}/${eKey}` });
        if (sDate >= eDate) return res.status(400).json({ message: `${sKey} must be earlier than ${eKey}` });
      }
    }

    // Build data to upsert (convert HH:mm -> Date or null)
    const dataAny: any = { Worker_Id: workerId };
    for (const f of fields) dataAny[f] = body[f] ? parseTimeOrNull(body[f]) : null;

    // Upsert by Worker_Id (find then create/update)
    const existing = await prisma.week_Schedule.findUnique({ where: { Worker_Id: workerId } });

    let result;
    if (existing) {
      result = await prisma.week_Schedule.update({
        where: { id: existing.id },
        data: dataAny
      });
    } else {
      result = await prisma.week_Schedule.create({ data: dataAny });
    }

    return res.json({ message: "Weekly schedule saved", schedule: result });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /schedule/month?month=YYYY-MM
// Returns all holiday entries for the month ONLY (no orders)
schedule.get("/month", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const month = String(req.query.month || "");

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month is required in YYYY-MM format" });
    }

    const start = dayjs(`${month}-01`).startOf("month").toDate();
    const end = dayjs(`${month}-01`).endOf("month").toDate();

    const holidays = await prisma.month_Schedule.findMany({
      where: { Worker_Id: workerId, date: { gte: start, lte: end } },
      orderBy: { date: "asc" }
    });

    return res.json({ month, holidays });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


// POST /schedule/month
schedule.post("/month", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const { date, note } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date is required in YYYY-MM-DD" });
    }

    const parsed = dayjs(date).startOf("day").toDate();

    const exists = await prisma.month_Schedule.findFirst({
      where: { Worker_Id: workerId, date: parsed }
    });

    if (exists) {
      return res.status(400).json({ message: "Holiday already added for this date" });
    }

    const created = await prisma.month_Schedule.create({
      data: {
        Worker: { connect: { id: workerId } },
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


// DELETE /schedule/month/:id
schedule.delete("/month/:id", userAuth, async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);

    const entry = await prisma.month_Schedule.findUnique({ where: { id } });

    if (!entry || entry.Worker_Id !== req.user.id) {
      return res.status(404).json({ message: "Holiday not found or unauthorized" });
    }

    const deleted = await prisma.month_Schedule.delete({ where: { id } });

    return res.json({ message: "Holiday removed", deleted });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default schedule;
