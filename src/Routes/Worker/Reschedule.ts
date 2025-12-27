import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const orderStatus = Router();

orderStatus.post("/orders/:id/cancel", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const clientId = req.user.id;

    // 1️⃣ Fetch order
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    if (!order || order.clientId !== clientId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // 2️⃣ Only cancel if pending
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    // 3️⃣ Cancel order
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: { Order_Status: 3 },
    });

    // 4️⃣ Create notification for the worker
    await prisma.notification.create({
      data: {
        clientId: clientId,
        workerId: order.workerId,
        orderId: order.id,
        message: `Client cancelled the booking scheduled on ${order.date.toISOString().split("T")[0]}.`
      }
    });

    // 5️⃣ Return success response
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
    const finalDateTime = new Date(`${new_date}T${new_time}:00`);

    // Get existing order
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // Only pending orders can be rescheduled
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be rescheduled" });
    }

    // Do not allow past dates
    if (selectedDate < new Date(today.toDateString())) {
      return res.status(400).json({ message: "You cannot reschedule to a past date" });
    }

    // If same day → ensure time is in future
    const isSameDay = selectedDate.toDateString() === today.toDateString();
    if (isSameDay && finalDateTime <= today) {
      return res.status(400).json({ message: "Reschedule time must be in the future" });
    }

    // Check slot availability
    const existingSlot = await prisma.workerOrder.findFirst({
      where: {
        workerId: order.workerId,
        date: selectedDate,
        time: finalDateTime,
        NOT: { id: orderId }, // avoid blocking self
        Order_Status: { not: 3 } // only active orders block
      }
    });

    if (existingSlot) {
      return res.status(400).json({ message: "This time slot is already booked" });
    }

    // Update order
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: {
        reschedule_comment: comment,
        date: selectedDate,
        time: finalDateTime,
      }
    });

    // Send notification to client
    await prisma.notification.create({
      data: {
        clientId: order.clientId,
        workerId: order.workerId,
        orderId: order.id,
        message: `Worker rescheduled your booking to ${new_date} at ${new_time}`
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