import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const schedule = Router();

schedule.post("/orders/:id/reschedule", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const { comment, new_date, new_time } = req.body;

    if (!comment || !new_date || !new_time) {
      return res.status(400).json({ message: "comment, new_date, new_time required" });
    }

    const finalDateTime = new Date(`${new_date}T${new_time}:00`);

    const updated = await prisma.worker_Order.update({
      where: { id: orderId },
      data: {
        reschedule_comment: comment,
        date: new Date(new_date),
        time: finalDateTime,
        Work_Status: "rescheduled"
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

    const order = await prisma.worker_Order.findUnique({
      where: { id: orderId }
    });

    if (!order || order.Client_Id !== clientId) {
      return res.status(404).json({ message: "Order not found or unauthorized" });
    }

    const updated = await prisma.worker_Order.update({
      where: { id: orderId },
      data: { Work_Status: "canceled" }
    });

    return res.json({ message: "Order canceled", order: updated });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});
export default schedule;
