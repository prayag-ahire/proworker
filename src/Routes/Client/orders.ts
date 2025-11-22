import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const clientOrders = Router();

clientOrders.get("/orders/my", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;

    const allOrders = await prisma.worker_Order.findMany({
      where: { Client_Id: clientId },
      orderBy: { id: "desc" },
      include: {
        worker: {
          select: {
            Name: true,
            ImgURL: true,
            Description: true,   // profession
          }
        }
      }
    });

    const formatted = allOrders.map((order:any) => ({
      orderId: order.id,
      workerName: order.worker.Name,
      workerImage: order.worker.ImgURL,
      profession: order.worker.Description,
      status: order.Work_Status,
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

    const order = await prisma.worker_Order.findFirst({
      where: { id: orderId, Client_Id: clientId },
      include: {
        worker: {
          select: {
            Name: true,
            ImgURL: true,
            Description: true,
            Rating: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json({
      orderId: order.id,
      status: order.Work_Status,
      date: order.date,
      time: order.time,
      worker: {
        name: order.worker.Name,
        image: order.worker.ImgURL,
        profession: order.worker.Description,
        rating: order.worker.Rating
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default clientOrders;
