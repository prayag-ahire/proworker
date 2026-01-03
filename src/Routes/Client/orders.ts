import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const clientOrders = Router();

clientOrders.get("/orders/my", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.userId;

    const allOrders = await prisma.workerOrder.findMany({
      where: { clientId: clientId },
      orderBy: { id: "desc" },
      include: {
        worker: {
          select: {
            username: true,
            ImgURL: true,
            profession: true
          }
        },
        Status: true
      }
    });

    const formatted = allOrders.map((order:any) => ({
      orderId: order.id,
      workerName: order.worker.username,
      workerImage: order.worker.ImgURL,
      profession: order.worker.profession,
      status: order.Status.status_name,
      date: order.date,
      time: order.time
    }));

    return res.json({ orders: formatted });

  } catch (err: any) {
    console.error("Orders fetch failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});



clientOrders.get("/orders/:id", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.userId;
    const orderId = Number(req.params.id);

    const order = await prisma.workerOrder.findUnique({
      where: { id: orderId },
      include: {
        worker: {
          select: {
            username: true,
            ImgURL: true,
            profession: true,
            Rating: true
          }
        },
        Status: true
      }
    });

    if (!order || order.clientId !== clientId) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      orderId: order.id,
      status: order.Status.status_name,
      date: order.date,
      time: order.time,
      worker: {
        name: order.worker.username,
        image: order.worker.ImgURL,
        profession: order.worker.profession,
        rating: order.worker.Rating
      }
    });

  } catch (err: any) {
    console.error("Order fetch failed:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default clientOrders;
