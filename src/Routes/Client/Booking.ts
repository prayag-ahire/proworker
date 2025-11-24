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

    // Convert TIME only
    const onlyTime = new Date(`1970-01-01T${time}:00`);
    const finalDateTime = new Date(`${date}T${time}:00`);

    // Past date
    if (selectedDate < new Date(today.toDateString())) {
      return res.status(400).json({ message: "You cannot book for past dates." });
    }

    // Same-day past time
    const isSameDay = selectedDate.toDateString() === today.toDateString();
    if (isSameDay && finalDateTime <= today) {
      return res.status(400).json({ message: "Booking time must be in the future." });
    }

    // Slot check
    const existingOrder = await prisma.workerOrder.findFirst({
      where: {
        workerId,
        date: selectedDate,
        time: onlyTime
      }
    });

    // Slot is blocked if order exists and status != cancelled
    if (existingOrder && existingOrder.Order_Status !== 3) {
      return res.status(400).json({ message: "Time slot is not available!" });
    }

    // Create order
    const order = await prisma.workerOrder.create({
      data: {
        date: selectedDate,
        time: onlyTime,
        Status: { connect: { id: 2 } }, // Pending
        reschedule_comment: null,
        worker: { connect: { id: workerId } },
        client: { connect: { id: clientId } }
      },
      include: {
        Status: true
      }
    });

    return res.json({ message: "Order created successfully", order });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});




export default Booking;