// routes/orders.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const orders = Router();

// GET /orders/history
// Returns all orders for logged-in worker sorted newest -> oldest
orders.get("/orders/history", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;

    const allOrders = await prisma.workerOrder.findMany({
      where: { workerId: workerId },
      orderBy: { date: "desc" },
      include: { 
        client: {
          select: {
            username: true,
            ImgURL: true
          }
        },
        Status: true
      }
    });

    // map to UI-friendly shape
    const payload = allOrders.map((o:any) => ({
      id: o.id,
      clientName: o.client?.username ?? null,
      clientImage: o.client?.ImgURL ?? null,
      status: o.Status.status_name,
      date: o.date,
      time: o.time
    }));

    return res.json(payload);
  } catch (err: any) {
    console.error("Orders fetch failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// GET /orders/:id
// Returns full order details for a single order
orders.get("/orders/:id", userAuth, async (req: any, res: Response) => {
  try {
    const id = Number(req.params.id);
    const workerId = req.user.userId;

    const order = await prisma.workerOrder.findUnique({
      where: { id },
      include: { 
        client: {
          select: {
            username: true,
            ImgURL: true,
            email: true
          }
        },
        Status: true 
      }
    });

    if (!order || order.workerId !== workerId) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      id: order.id,
      clientName: order.client?.username ?? null,
      clientImage: order.client?.ImgURL ?? null,
      clientEmail: order.client?.email ?? null,
      status: order.Status.status_name,
      date: order.date,
      time: order.time,
      reschedule_comment: order.reschedule_comment ?? null
    });
  } catch (err: any) {
    console.error("Order fetch failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default orders;
