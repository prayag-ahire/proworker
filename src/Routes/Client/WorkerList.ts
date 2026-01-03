import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const workerlist = Router();

workerlist.get("/workers", userAuth, async (req: any, res: Response) => {
  try {
    const {
      search = "",
      price = "",
      rating = "",
      page = 1,
      limit = 10
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    // ---------------- BASE QUERY ----------------
    let whereClause: any = {};

    // SEARCH by username
    if (search) {
      whereClause.username = {
        contains: String(search),
        mode: "insensitive"
      };
    }

    // ---------------- FETCH LIMITED DATA ----------------
    const workers = await prisma.worker.findMany({
      where: whereClause,
      skip: skip,
      take: limitNum,
      orderBy: { id: "desc" }, // newest workers first
      select: {
        id: true,
        username: true,
        ImgURL: true,
        Rating: true,
        Charges_PerVisit: true
      }
    });

    // 🔐 Atomic data transformation
    const processed = workers.map((w:any) => {
      const priceValue = w.Charges_PerVisit || 0;
      const priceType = priceValue > 0 ? "visit" : "none";

      return {
        id: w.id,
        name: w.username,
        image: w.ImgURL,
        rating: w.Rating,
        price: priceValue,
        price_type: priceType
      };
    });

    // ---------------- PRICE SORT ----------------
    if (price === "asc") {
      processed.sort((a:any, b:any) => a.price - b.price);
    } else if (price === "desc") {
      processed.sort((a:any, b:any) => b.price - a.price);
    }

    // ---------------- RATING SORT ----------------
    if (rating === "asc") {
      processed.sort((a:any, b:any) => Number(a.rating) - Number(b.rating));
    } else if (rating === "desc") {
      processed.sort((a:any, b:any) => Number(b.rating) - Number(a.rating));
    }

    return res.json({
      page: pageNum,
      limit: limitNum,
      workers: processed
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});


workerlist.get("/worker/:id", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = Number(req.params.id);

    const worker = await prisma.worker.findUnique({
      where: { id: workerId },
      select: {
        id: true,
        username: true,
        ImgURL: true,
        // Contact_number: true,
        Rating: true,
        Description: true,
        Charges_PerVisit: true,

        worker_image: true,
        Worker_video: true,
        review: {
          select: {
            id: true,
            Name: true,
            Comment: true,
            images: true,
            videos: true,
          }
        }
      }
    });

    if (!worker) {
      return res.status(404).json({ message: "Worker not found" });
    }

    return res.json(worker);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


export default workerlist;
