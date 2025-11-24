import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import { includes } from "zod";

const prisma = new PrismaClient();
const schedule = Router();

schedule.post("/orders/:id/reschedule", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const clientId = req.user.id; // verify ownership also if needed
    const { comment, new_date, new_time } = req.body;

    if (!comment || !new_date || !new_time) {
      return res.status(400).json({ message: "comment, new_date, new_time required" });
    }

    const finalDateTime = new Date(`${new_date}T${new_time}:00`);

    // 🔍 Get order first
    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    // ❌ Not found OR unauthorized
    if (!order || order.clientId !== clientId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // ❌ Allow reschedule only when status = Pending (2)
    if (order.Order_Status !== 2) {
      return res.status(400).json({
        message: "Only pending orders can be rescheduled"
      });
    }

    // ✔ Update order (allowed)
    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: {
        reschedule_comment: comment,
        date: new Date(new_date),
        time: finalDateTime,
      },
      include: {
        Status: true
      }
    });

    return res.json({
      message: "Order rescheduled successfully",
      order: updated
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});



schedule.post("/orders/:id/cancel", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const clientId = req.user.id;

    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId }
    });

    if (!order || order.clientId !== clientId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    // 👉 allow cancel only if status is Pending (2)
    if (order.Order_Status !== 2) {
      return res.status(400).json({
        message: "Only pending orders can be cancelled"
      });
    }

    const updated = await prisma.workerOrder.update({
      where: { id: orderId },
      data: { Order_Status: 3 }, // cancelled
      select: {
        id: true,
        Order_Status: true,
        date: true,
        time: true
      }
    });

    return res.json({ message: "Order canceled", order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default schedule;
