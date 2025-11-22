import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import dayjs from "dayjs";

const prisma = new PrismaClient();
const Booking = Router();


Booking.get("/:workerId/available-dates", userAuth, async (req: any, res) => {
  try {
    const workerId = Number(req.params.workerId);
    const month = String(req.query.month); // YYYY-MM

    const start = dayjs(`${month}-01`).startOf("month");
    const end = dayjs(`${month}-01`).endOf("month");

    // 1. Get weekly schedule
    const schedule = await prisma.week_Schedule.findFirst({
      where: { Worker_Id: workerId }
    });

    // 2. Get holidays in the month
    const holidays = await prisma.month_Schedule.findMany({
      where: { Worker_Id: workerId, date: { gte: start.toDate(), lte: end.toDate() } },
      select: { date: true }
    });

    const holidayDates = holidays.map((h:any) =>
      dayjs(h.date).format("YYYY-MM-DD")
    );

    const daysInMonth = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
      const dayName = current.format("dddd").toLowerCase(); // "monday"

      const startKey = `Start_${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
      const endKey = `End_${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;

      const isHoliday = holidayDates.includes(current.format("YYYY-MM-DD"));
      const hasWorkingHours = schedule[startKey] && schedule[endKey];

      if (!isHoliday && hasWorkingHours) {
        daysInMonth.push({
          date: current.format("YYYY-MM-DD"),
          available: true
        });
      }

      current = current.add(1, "day");
    }

    return res.json({
      workerId,
      month,
      availableDates: daysInMonth
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


Booking.get("/:workerId/time-slots", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = Number(req.params.workerId);
    const date = req.query.date; // YYYY-MM-DD
    const dayName = dayjs(date).format("dddd").toLowerCase();

    const startKey = `Start_${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;
    const endKey = `End_${dayName.charAt(0).toUpperCase() + dayName.slice(1)}`;

    const schedule = await prisma.week_Schedule.findFirst({
      where: { Worker_Id: workerId }
    });

    const startTime = schedule[startKey];
    const endTime = schedule[endKey];

    if (!startTime || !endTime) {
      return res.json({ timeSlots: [] });
    }

    // Convert to DayJS
    let start = dayjs(`${date}T${dayjs(startTime).format("HH:mm")}`);
    const end = dayjs(`${date}T${dayjs(endTime).format("HH:mm")}`);

    const slots = [];

    // get existing bookings
    const existing = await prisma.worker_Order.findMany({
      where: {
        worker_Id: workerId,
        date: new Date(date)
      }
    });

    const bookedTimes = existing.map((o:any) => dayjs(o.time).format("HH:mm"));

    while (start.isBefore(end)) {
      const slotStart = start.format("HH:mm");
      const slotEnd = start.add(1, "hour").format("HH:mm");

      const isBooked = bookedTimes.includes(slotStart);

      slots.push({
        start: slotStart,
        end: slotEnd,
        available: !isBooked
      });

      start = start.add(1, "hour");
    }

    return res.json({ date, workerId, timeSlots: slots });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


Booking.post("/create", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;
    const { workerId, date, time, comment } = req.body;

    const finalDateTime = new Date(`${date}T${time}:00`);

    // check if slot already booked
    const isBooked = await prisma.worker_Order.findFirst({
      where: { worker_Id: workerId, time: finalDateTime }
    });

    if (isBooked) {
      return res.status(400).json({ message: "Time slot already booked!" });
    }

    const order = await prisma.worker_Order.create({
      data: {
        worker_Id: workerId,
        Client_Id: clientId,
        date: new Date(date),
        time: finalDateTime,
        Work_Status: "pending",
        reschedule_comment: comment || null
      }
    });

    return res.json({
      message: "Order created successfully",
      order
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


module.exports = Booking;