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
    const workerId = req.user.userId;

    const worker = await prisma.worker_User.findUnique({
      where: { id: workerId },
      select: {
        worker: {
          select: {
            id: true
          }
        }
      }
    });

    const schedule = await prisma.weekSchedule.findUnique({
      where: { workerId: worker?.worker?.id },
      select: {
        Start_Sunday: true,
        End_Sunday: true,
        Start_Monday: true,
        End_Monday: true,
        Start_Tuesday: true,
        End_Tuesday: true,
        Start_Wednesday: true,
        End_Wednesday: true,
        Start_Thursday: true,
        End_Thursday: true,
        Start_Friday: true,
        End_Friday: true,
        Start_Saturday: true,
        End_Saturday: true
      }
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
    const workerId = req.user.userId;
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

    const worker = await prisma.worker_User.findUnique({
      where: { id: workerId },
      select: {
        worker: {
          select: {
            id: true
          }
        }
      }
    });
    // Check if schedule exists
    const existing = await prisma.weekSchedule.findUnique({
      where: { workerId: worker?.worker?.id }
    });

    let result;

    if (existing) {
      // Update only the provided fields
      result = await prisma.weekSchedule.update({
        where: {  workerId: worker?.worker?.id },
        data: dataToSave
      });
    } else {
      // Create — only relation + time fields allowed
      result = await prisma.weekSchedule.create({
        data: {
          worker: { connect: { id: worker?.worker?.id } }, // Prisma sets workerId automatically
          ...dataToSave
        },
        select: {
        Start_Sunday: true,
        End_Sunday: true,
        Start_Monday: true,
        End_Monday: true,
        Start_Tuesday: true,
        End_Tuesday: true,
        Start_Wednesday: true,
        End_Wednesday: true,
        Start_Thursday: true,
        End_Thursday: true,
        Start_Friday: true,
        End_Friday: true,
        Start_Saturday: true,
        End_Saturday: true
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



schedule.get("/WorkerSchedule/month", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const month = String(req.query.month || "");

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "month is required in YYYY-MM format" });
    }

    const start = dayjs(`${month}-01`).startOf("month").toDate();
    const end = dayjs(`${month}-01`).endOf("month").toDate();

    const worker = await prisma.worker_User.findUnique({
      where: { id: workerId },
      select: {
        worker: {
          select: {
            id: true
          }
        }
      }
    });

    const holidays = await prisma.monthSchedule.findMany({
      where: { workerId: worker?.worker?.id, date: { gte: start, lte: end } },
      orderBy: [
        { date: "asc" },
        { id: "asc" }
      ]
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
    const workerId = req.user.userId;
    const { date, note } = req.body;

    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "date is required in YYYY-MM-DD" });
    }

    const holidayDate = dayjs(date).startOf("day");
    const today = dayjs().startOf("day");

    // worker cannot pick past dates
    if (holidayDate.isBefore(today)) {
      return res.status(400).json({ message: "You cannot add a holiday for a past date" });
    }

    const worker = await prisma.worker_User.findUnique({
      where: { id: workerId },
      select: {
        worker: {
          select: {
            id: true
          }
        }
      }
    });
    // check if holiday already exists
    const exists = await prisma.monthSchedule.findFirst({
      where: { workerId: worker?.worker?.id, date: holidayDate.toDate() }
    });

    if (exists) {
      return res.status(400).json({ message: "Holiday already added for this date" });
    }

    // find all orders on same date
    const orders = await prisma.workerOrder.findMany({
      where: {
        workerId: worker?.worker?.id,
        date: holidayDate.toDate(),
        Order_Status: 2 // only pending orders
      }
    });

    // cancel all bookings and notify clients
    const notifications: any[] = [];
    const canceledOrders: any[] = [];

    for (const order of orders) {

      // cancel the order
      const updatedOrder = await prisma.workerOrder.update({
        where: { id: order.id },
        data: { Order_Status: 3 }
      });

      canceledOrders.push(updatedOrder);

      // send notification
      const note = await prisma.notification.create({
        data: {
          clientId: order.clientId,
          workerId: workerId,
          orderId: order.id,
          message: "Your booking was canceled. Worker added a holiday. Please reschedule or cancel."
        }
      });

      notifications.push(note);
    }

    // finally add the holiday
    const holiday = await prisma.monthSchedule.create({
      data: {
        workerId: worker?.worker?.id!,
        date: holidayDate.toDate(),
        note: note ?? null
      }
    });

    return res.status(201).json({
      message: "Holiday added successfully",
      holiday,
      canceledOrders,
      notifications
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});



schedule.delete("/WorkerSchedule/month", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const date = String(req.query.date);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Date must be YYYY-MM-DD" });
    }

    const parsed = dayjs(date).startOf("day").toDate();

    const worker = await prisma.worker_User.findUnique({
      where: { id: workerId },
      select: {
        worker: {
          select: {
            id: true
          }
        }
      }
    });

    const entry = await prisma.monthSchedule.findFirst({
      where: { workerId: worker?.worker?.id, date: parsed }
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
