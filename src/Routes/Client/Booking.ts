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

    const finalDateTime = new Date(`${date}T${time}:00`);
    const today = new Date();

    // ============================
    // 1️⃣ Date must not be in past
    // ============================
    const selectedDate = new Date(date);

    // If date is before today → reject
    if (selectedDate < new Date(today.toDateString())) {
      return res.status(400).json({ message: "You cannot book for past dates." });
    }

    // ============================
    // 2️⃣ If same day → time must be future
    // ============================
    const isSameDay =
      selectedDate.toDateString() === today.toDateString();

    if (isSameDay && finalDateTime <= today) {
      return res.status(400).json({ message: "Booking time must be in the future." });
    }

    // ============================
    // 3️⃣ Check slot availability
    // ============================
    const isBooked = await prisma.workerOrder.findFirst({
      where: {
        workerId: workerId,
        date: new Date(date),
        time: finalDateTime
      }
    });

    if (isBooked) {
      return res.status(400).json({ message: "Time slot is already booked!" });
    }

    // ============================
    // 4️⃣ Create Booking
    // ============================
    const order = await prisma.workerOrder.create({
      data: {
        date: new Date(date),
        time: finalDateTime,
        Work_Status: "pending",
        reschedule_comment: null,
        worker: { connect: { id: workerId } },
        client: { connect: { id: clientId } }
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