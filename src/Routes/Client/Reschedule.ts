import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import { includes } from "zod";

const prisma = new PrismaClient();
const schedule = Router();

schedule.post("/orders/:id/reschedule", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const clientId = req.user.userId;
    const { comment, new_date, new_time } = req.body;

    if (!comment || !new_date || !new_time) {
      return res.status(400).json({ message: "comment, new_date, new_time required" });
    }

    const selectedDate = new Date(new_date);
    const finalDateTime = new Date(`${new_date}T${new_time}:00`);
    const now = new Date();

    // Get order with proper authorization
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    if (!order || order.clientId !== clientId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // Only pending orders
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be rescheduled" });
    }

    // No past date
    if (selectedDate < new Date(now.toDateString())) {
      return res.status(400).json({ message: "Cannot reschedule to a past date" });
    }

    // If same day → time must be future
    const isSameDay = selectedDate.toDateString() === now.toDateString();
    if (isSameDay && finalDateTime <= now) {
      return res.status(400).json({ message: "Time must be in the future" });
    }

    // Check if slot already booked
    const slotTaken = await prisma.workerOrder.findFirst({
      where: {
        workerId: order.workerId,
        date: selectedDate,
        time: finalDateTime,
        NOT: { id: orderId },
        Order_Status: { not: 3 }
      }
    });

    if (slotTaken) {
      return res.status(409).json({ message: "This time slot is already booked" });
    }

    // 🔐 Atomic update operation
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: {
        reschedule_comment: comment,
        date: selectedDate,
        time: finalDateTime,
      },
      select: {
        id: true,
        date: true,
        time: true,
        workerId: true
      }
    });

    // Notification to worker
    await prisma.notification.create({
      data: {
        clientId: clientId,
        workerId: updated.workerId,
        orderId: orderId,
        message: `Client requested to reschedule the booking to ${new_date} at ${new_time}`
      }
    });

    return res.json({
      message: "Order rescheduled successfully",
      order: updated
    });

  } catch (err: any) {
    console.error("Order reschedule failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


schedule.post("/orders/:id/cancel", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const clientId = req.user.id;

    // 1. Get order
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    // 2. Check existence + authorization
    if (!order || order.clientId !== clientId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // 3. Only pending orders can be canceled
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be canceled" });
    }

    // 4. 🔐 Atomic cancel operation
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: { Order_Status: 3 },
      select: {
        id: true,
        Order_Status: true,
        date: true,
        workerId: true
      }
    });

    // 5. Notify worker
    await prisma.notification.create({
      data: {
        clientId: clientId,
        workerId: updated.workerId,
        orderId: orderId,
        message: `Client canceled the booking scheduled for ${updated.date.toISOString().split("T")[0]}`
      }
    });

    return res.json({
      message: "Order canceled successfully",
      order: updated
    });

  } catch (err: any) {
    console.error("Order cancellation failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default schedule;
