import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const orderStatus = Router();

orderStatus.post("/orders/:id/cancel", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);

    // 🔍 Get order first
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ❌ Allow cancel only if PENDING (2)
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    // ✔ Cancel the order
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: { Order_Status: 3 }
    });

    return res.json({
      message: "Order canceled successfully",
      order: updated
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


orderStatus.post("/orders/:id/reschedule", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { comment, new_date, new_time } = req.body;

    if (!comment || !new_date || !new_time) {
      return res.status(400).json({ message: "comment, new_date, new_time required" });
    }

    const today = new Date();
    const selectedDate = new Date(new_date);
    const onlyTime = new Date(`1970-01-01T${new_time}:00`);
    const finalDateTime = new Date(`${new_date}T${new_time}:00`);

    // 🔍 Get existing order
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // ❌ Allow rescheduling only if pending
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be rescheduled" });
    }

    // 📅 No past dates
    if (selectedDate < new Date(today.toDateString())) {
      return res.status(400).json({ message: "You cannot reschedule to a past date" });
    }

    // 🕒 Same day: must be future time
    const isSameDay = selectedDate.toDateString() === today.toDateString();
    if (isSameDay && finalDateTime <= today) {
      return res.status(400).json({ message: "Reschedule time must be in the future" });
    }

    // 🟡 Check slot availability (except cancelled ones)
    const existingSlot = await prisma.workerOrder.findFirst({
      where: {
        workerId: order.workerId,
        date: selectedDate,
        time: onlyTime
      }
    });

    if (existingSlot && existingSlot.Order_Status !== 3 && existingSlot.id !== orderId) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // ✔ Update order
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: {
        reschedule_comment: comment,
        date: selectedDate,
        time: onlyTime,
      }
    });

    return res.json({
      message: "Order rescheduled successfully",
      order: updated
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


export default orderStatus;