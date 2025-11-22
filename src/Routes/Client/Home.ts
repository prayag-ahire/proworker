import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const clientOrders = Router();

// ==================== GET ALL ORDERS ====================
clientOrders.get("/orders", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;

    const orders = await prisma.worker_Order.findMany({
      where: { Client_Id: clientId },
      orderBy: { id: "desc" },
      include: {
        worker: {
          select: {
            id: true,
            Name: true,
            ImgURL: true,
            Rating: true,
            Charges_PerHour: true,
            Charges_PerVisit: true,
            Description: true
          }
        }
      }
    });

    return res.json({ orders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// ==================== GET ORDER BY ID ====================
clientOrders.get("/orders/:id", userAuth, async (req: any, res: Response) => {
  try {
    const orderId = Number(req.params.id);
    const clientId = req.user.id;

    const order = await prisma.worker_Order.findFirst({
      where: {
        id: orderId,
        Client_Id: clientId
      },
      include: {
        worker: {
          select: {
            id: true,
            Name: true,
            ImgURL: true,
            Rating: true,
            Description: true,
            Charges_PerHour: true,
            Charges_PerVisit: true
          }
        }
      }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    return res.json(order);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default clientOrders;
