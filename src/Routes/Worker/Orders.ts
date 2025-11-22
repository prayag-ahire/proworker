// routes/orders.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const orders = Router();

// GET /orders/history
// Returns all orders for logged-in worker sorted newest -> oldest
orders.get("/history", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;

    const orders = await prisma.worker_Order.findMany({
      where: { worker_Id: workerId },
      orderBy: { date: "desc" },
      include: { client: true } // include client details for display
    });

    // map to UI-friendly shape
    const payload = orders.map((o:any) => ({
      id: o.id,
      clientName: o.client ? (o.client as any).name ?? null : null,
      status: o.Work_Status,
      date: o.date,
      time: o.time
    }));

    return res.json(payload);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /orders/:id
// Returns full order details for a single order
orders.get("/:id", userAuth, async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);
    const workerId = req.user.id;

    const order = await prisma.worker_Order.findUnique({
      where: { id },
      include: { client: true }
    });

    if (!order || order.worker_Id !== workerId) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      id: order.id,
      client: order.client ? (order.client as any).name ?? null : null,
      clientProfile: order.client ? (order.client as any).ImgURL ?? null : null,
      status: order.Work_Status,
      date: order.date,
      time: order.time,
      reschedule_comment: order.reschedule_comment ?? null
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default orders;
