import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";

dayjs.extend(weekOfYear);

const prisma = new PrismaClient();
const Home = Router();

Home.get("/home/me", userAuth, async (req: any, res: Response) => {
    try {
        const workerId = req.user.id;
        const view = req.query.view || "day";

        const today = dayjs();

        // -------- DAY VIEW --------
        if (view === "day") {
            const todaysDate = today.format("YYYY-MM-DD");

            const orders = await prisma.worker_Order.findMany({
                where: {
                    worker_Id: workerId,
                    date: new Date(todaysDate)
                },
                include: {
                    client: {
                        include: {
                            client_settings: true
                        }
                    }
                }
            });

            const summary = {
                pending: orders.filter((o: any) => o.Work_Status === "pending").length,
                completed: orders.filter((o: any) => o.Work_Status === "completed").length,
                canceled: orders.filter((o: any) => o.Work_Status === "canceled").length,
            };

            return res.json({
                view: "day",
                date: today.format("DD MMM, dddd"),
                orders,
                summary
            });
        }

        // -------- WEEK VIEW --------
        if (view === "week") {
            const start = today.startOf("week");
            const end = today.endOf("week");

            const orders = await prisma.worker_Order.findMany({
                where: {
                    worker_Id: workerId,
                    date: {
                        gte: start.toDate(),
                        lte: end.toDate()
                    }
                }
            });

            const weekData = [];

            for (let i = 0; i < 7; i++) {
                const day = start.add(i, "day");

                const dayOrders = orders.filter((o: any) =>
                    dayjs(o.date).isSame(day, "day")
                );

                weekData.push({
                    day: day.format("dddd"),
                    count: dayOrders.length,
                    pending: dayOrders.filter((o: any) => o.Work_Status === "pending").length,
                    completed: dayOrders.filter((o: any) => o.Work_Status === "completed").length,
                    canceled: dayOrders.filter((o: any) => o.Work_Status === "canceled").length,
                });
            }

            return res.json({
                view: "week",
                weekName: `Week ${today.week()}`,
                days: weekData
            });
        }

        // -------- MONTH VIEW --------
        if (view === "month") {
            const start = today.startOf("month").toDate();
            const end = today.endOf("month").toDate();

            const orders = await prisma.worker_Order.findMany({
                where: {
                    worker_Id: workerId,
                    date: { gte: start, lte: end }
                }
            });

            const totalOrders = orders.length;

            const summary = {
                pending: orders.filter((o: any) => o.Work_Status === "pending").length,
                completed: orders.filter((o: any) => o.Work_Status === "completed").length,
                canceled: orders.filter((o: any) => o.Work_Status === "canceled").length,
            };

            return res.json({
                view: "month",
                month: today.format("MMMM YYYY"),
                totalOrders,
                summary
            });
        }

        return res.status(400).json({ message: "Invalid view" });

    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

export default Home;
