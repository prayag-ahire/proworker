import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const Booking = Router();

// ==================== CREATE BOOKING ====================
Booking.post("/Booking/create", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;
    const { workerId, date, time } = req.body;

    const today = new Date();
    const selectedDate = new Date(date);

    const onlyTime = new Date(`1970-01-01T${time}:00`);
    const finalDateTime = new Date(`${date}T${time}:00`);

    // ❌ Past date check
    if (selectedDate < new Date(today.toDateString())) {
      return res.status(400).json({ message: "You cannot book for past dates." });
    }

    // ❌ Same-day + past time
    const isSameDay = selectedDate.toDateString() === today.toDateString();
    if (isSameDay && finalDateTime <= today) {
      return res.status(400).json({ message: "Booking time must be in the future." });
    }

    // ❌ Check if slot is already booked
    const existingOrder = await prisma.workerOrder.findFirst({
      where: {
        workerId,
        date: selectedDate,
        time: onlyTime
      }
    });

    if (existingOrder && existingOrder.Order_Status !== 3) {
      return res.status(400).json({ message: "Time slot is not available!" });
    }

    // ✔ Create booking
    const order = await prisma.workerOrder.create({
      data: {
        date: selectedDate,
        time: onlyTime,
        Order_Status: 2, // pending
        reschedule_comment: null,
        workerId: workerId,
        clientId: clientId
      }
    });

    // ✔ Notify worker
    await prisma.notification.create({
      data: {
        clientId,
        workerId,
        orderId: order.id,
        message: `New booking received for ${date} at ${time}`
      }
    });

    return res.json({
      message: "Order created successfully",
      order
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


export default Booking;