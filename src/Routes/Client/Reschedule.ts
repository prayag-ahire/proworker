import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import dayjs from "dayjs";

const prisma = new PrismaClient();
const schedule = Router();

schedule.get("/worker/:id/available-dates", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = Number(req.params.id);
    const month = String(req.query.month);

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Month must be YYYY-MM" });
    }

    const start = dayjs(`${month}-01`).startOf("month");
    const end = dayjs(`${month}-01`).endOf("month");

    const week = await prisma.week_Schedule.findUnique({ where: { Worker_Id: workerId } });
    if (!week) return res.json({ availableDates: [] });

    const holidays = await prisma.month_Schedule.findMany({
      where: { Worker_Id: workerId, date: { gte: start.toDate(), lte: end.toDate() } }
    });

    const holidayDates = new Set(holidays.map((h:any) => dayjs(h.date).format("YYYY-MM-DD")));

    const availableDates: string[] = [];

    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {
      const weekday = d.format("dddd").toLowerCase();
      const dayKeyStart = `Start_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;
      const dayKeyEnd = `End_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;

      if (!week[dayKeyStart] || !week[dayKeyEnd]) continue;
      if (holidayDates.has(d.format("YYYY-MM-DD"))) continue;

      availableDates.push(d.format("YYYY-MM-DD"));
    }

    return res.json({ availableDates });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});



schedule.get("/worker/:id/available-slots", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = Number(req.params.id);
    const date = String(req.query.date);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Date must be YYYY-MM-DD" });
    }

    const d = dayjs(date);
    const weekday = d.format("dddd").toLowerCase();

    const week = await prisma.week_Schedule.findUnique({ where: { Worker_Id: workerId } });
    if (!week) return res.json({ slots: [] });

    const startKey = `Start_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;
    const endKey = `End_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;

    const start = week[startKey];
    const end = week[endKey];

    if (!start || !end) return res.json({ slots: [] });

    const orders = await prisma.worker_Order.findMany({
      where: { worker_Id: workerId, date: new Date(date) },
      select: { time: true }
    });

    const bookedTimes = new Set(orders.map((o:any) => dayjs(o.time).format("HH:mm")));

    const slots: string[] = [];
    let cur = dayjs(start);
    const endTime = dayjs(end);

    while (true) {
      const next = cur.add(1, "hour");
      if (!(next.isBefore(endTime) || next.isSame(endTime))) break;

      const slotStart = cur.format("HH:mm");
      const slotEnd = next.format("HH:mm");

      if (!bookedTimes.has(slotStart)) {
        slots.push(`${slotStart}-${slotEnd}`);
      }

      cur = next;
    }

    return res.json({ slots });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


schedule.post("/orders/:id/reschedule", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { comment, new_date, new_time } = req.body;

    if (!comment || !new_date || !new_time) {
      return res.status(400).json({ message: "comment, new_date, new_time required" });
    }

    const finalDateTime = new Date(`${new_date}T${new_time}:00`);

    const updated = await prisma.worker_Order.update({
      where: { id: orderId },
      data: {
        reschedule_comment: comment,
        date: new Date(new_date),
        time: finalDateTime,
        Work_Status: "rescheduled"
      }
    });

    return res.json({
      message: "Order rescheduled successfully",
      order: updated
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default schedule;
