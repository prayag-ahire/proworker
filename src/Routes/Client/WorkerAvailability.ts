import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import dayjs from "dayjs";

const prisma = new PrismaClient();
const workerAvailability = Router();

workerAvailability.get("/worker/:id/available-dates", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = Number(req.params.id);
    const month = String(req.query.month);

    if (!/^\d{4}-\d{2}$/.test(month)) {
      return res.status(400).json({ message: "Month must be YYYY-MM" });
    }

    const start = dayjs(`${month}-01`).startOf("month");
    const end = dayjs(`${month}-01`).endOf("month");

    const week = await prisma.weekSchedule.findUnique({
      where: { workerId: workerId }
    });

    if (!week) return res.json({ availableDates: [] });

    const holidays = await prisma.monthSchedule.findMany({
      where: { workerId: workerId, date: { gte: start.toDate(), lte: end.toDate() } }
    });

    const holidayDates = new Set(holidays.map((h:any) => dayjs(h.date).format("YYYY-MM-DD")));

    const availableDates: string[] = [];

    for (let d = start; d.isBefore(end) || d.isSame(end, "day"); d = d.add(1, "day")) {

      const weekday = d.format("dddd").toLowerCase();
      const keyStart = `Start_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;
      const keyEnd = `End_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;

      const hasHours = (week as any)[keyStart] && (week as any)[keyEnd];
      const isHoliday = holidayDates.has(d.format("YYYY-MM-DD"));

      if (hasHours && !isHoliday) {
        availableDates.push(d.format("YYYY-MM-DD"));
      }
    }

    return res.json({ availableDates });

  } catch (err: any) {
    console.error("Available dates fetch failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


workerAvailability.get("/worker/:id/available-slots", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = Number(req.params.id);
    const date = String(req.query.date);

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({ message: "Date must be YYYY-MM-DD" });
    }

    const d = dayjs(date);
    const weekday = d.format("dddd").toLowerCase();

    const week = await prisma.weekSchedule.findUnique({
      where: { workerId: workerId }
    });

    if (!week) return res.json({ slots: [] });

    const startKey = `Start_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;
    const endKey = `End_${weekday.charAt(0).toUpperCase() + weekday.slice(1)}`;

    const start = week[startKey as keyof typeof week];
    const end = week[endKey as keyof typeof week];

    if (!start || !end) return res.json({ slots: [] });

    const orders = await prisma.workerOrder.findMany({
      where: { workerId: workerId, date: new Date(date) },
      select: { time: true }
    });

    const bookedTimes = new Set(
      orders.map((o:any) => dayjs(o.time).format("HH:mm"))
    );

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

  } catch (err: any) {
    console.error("Available slots fetch failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export = workerAvailability;