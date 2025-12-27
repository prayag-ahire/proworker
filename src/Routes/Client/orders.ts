import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const clientOrders = Router();

clientOrders.get("/orders/my", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;

    const allOrders = await prisma.workerOrder.findMany({
      where: { clientId: clientId },
      orderBy: { id: "desc" },
      include: {
        worker: {
          select: {
            username: true,
            ImgURL: true,
            Description: true,   // profession
          }
        },
        Status: true
      }
    });

    const formatted = allOrders.map((order:any) => ({
      orderId: order.id,
      workerName: order.worker.Name,
      workerImage: order.worker.ImgURL,
      profession: order.worker.Description,
      status: order.Status.status_name,
      date: order.date,
      time: order.time
    }));

    return res.json({ orders: formatted });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});



clientOrders.get("/orders/:id", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;
    const orderId = Number(req.params.id);

    const order = await prisma.workerOrder.findFirst({
      where: { id: orderId, clientId: clientId },
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

    if (!order) {
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
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default clientOrders;
