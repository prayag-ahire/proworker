import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const orderStatus = Router();

orderStatus.post("/orders/:id/cancel", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const workerId = req.user.userId;

    // 1️⃣ Fetch order
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    if (!order || order.workerId !== workerId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // 2️⃣ Only cancel if pending
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be cancelled" });
    }

    // 3️⃣ 🔐 Atomic cancel operation
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: { Order_Status: 3 },
      select: {
        id: true,
        Order_Status: true,
        date: true,
        clientId: true
      }
    });

    // 4️⃣ Create notification for the client
    await prisma.notification.create({
      data: {
        clientId: updated.clientId,
        workerId: workerId,
        orderId: orderId,
        message: `Worker cancelled the booking scheduled on ${updated.date.toISOString().split("T")[0]}.`
      }
    });

    // 5️⃣ Return success response
    return res.json({
      message: "Order canceled successfully",
      order: updated
    });

  } catch (err: any) {
    console.error("Order cancellation failed:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


orderStatus.post("/orders/:id/reschedule", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const workerId = req.user.userId;
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

    if (!order || order.workerId !== workerId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // Only pending orders can be rescheduled
    if (order.Order_Status !== 2) {
      return res.status(400).json({ message: "Only pending orders can be rescheduled" });
    }

    // Do not allow past dates
    if (selectedDate < new Date(today.toDateString())) {
      return res.status(400).json({ message: "Cannot reschedule to a past date" });
    }

    // If same day → ensure time is in future
    const isSameDay = selectedDate.toDateString() === today.toDateString();
    if (isSameDay && finalDateTime <= today) {
      return res.status(400).json({ message: "Time must be in the future" });
    }

    // Check slot availability
    const existingSlot = await prisma.workerOrder.findFirst({
      where: {
        workerId: workerId,
        date: selectedDate,
        time: finalDateTime,
        NOT: { id: orderId }, // avoid blocking self
        Order_Status: { not: 3 } // only active orders block
      }
    });

    if (existingSlot) {
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
        clientId: true
      }
    });

    // Send notification to client
    await prisma.notification.create({
      data: {
        clientId: updated.clientId,
        workerId: workerId,
        orderId: orderId,
        message: `Worker rescheduled your booking to ${new_date} at ${new_time}`
      }
    });

    return res.json({
      message: "Order rescheduled successfully",
      order: updated
    });

  } catch (err: any) {
    console.error("Order reschedule failed:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});



export default orderStatus;