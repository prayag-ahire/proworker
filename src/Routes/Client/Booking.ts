import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const Booking = Router();

// ==================== CREATE BOOKING ====================

Booking.post("/Booking/create", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;
    const { workerId, date, time} = req.body;

    const finalDateTime = new Date(`${date}T${time}:00`);

    // check if slot already booked
    const isBooked = await prisma.workerOrder.findFirst({
      where: { id: workerId, time: finalDateTime }
    });

    if (isBooked) {
      return res.status(400).json({ message: "Time slot already booked!" });
    }

    const order = await prisma.workerOrder.create({
      data: {
        date: new Date(date),
        time: finalDateTime,
        Work_Status: "pending",
        reschedule_comment: null,
        worker: {
          connect: { id: workerId }
        },
        client: {
          connect: { id: clientId }
        }
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