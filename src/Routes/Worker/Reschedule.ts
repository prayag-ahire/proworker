import { Router, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const orderStatus = Router();

orderStatus.post("/orders/:id/cancel", userAuth, async (req: any, res: Response) => {
    try {
        const orderId = Number(req.params.id);

        const updated = await prisma.workerOrder.update({
            where: { id: orderId },
            data: { Work_Status: "canceled" }
        });

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

        // Combine date + time into single DateTime
        const finalDateTime = new Date(`${new_date}T${new_time}:00`);

        const updated = await prisma.workerOrder.update({
            where: { id: orderId },
            data: {
                reschedule_comment: comment,
                date: new Date(new_date),
                time: finalDateTime,
                Work_Status: "rescheduled"
            }
        });

        return res.json({
            message: "Order Rescheduled Successfully",
            order: updated
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ message: "Internal Server Error" });
    }
});


export default orderStatus;