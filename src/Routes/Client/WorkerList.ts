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

    // SEARCH by name only (description removed)
    if (search) {
      whereClause.Name = {
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
        Name: true,
        ImgURL: true,
        Rating: true,
        Charges_PerHour: true,
        Charges_PerVisit: true
      }
    });

    // ---------------- PRICE PRIORITY ----------------
    const processed = workers.map((w:any) => {
      let priceValue = 0;
      let priceType = "";

      if (w.Charges_PerVisit && w.Charges_PerVisit > 0) {
        priceValue = w.Charges_PerVisit;
        priceType = "visit";
      } else if (w.Charges_PerHour && w.Charges_PerHour > 0) {
        priceValue = w.Charges_PerHour;
        priceType = "hour";
      } else {
        priceValue = 0;
        priceType = "none";
      }

      return {
        id: w.id,
        name: w.Name,
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
        Name: true,
        ImgURL: true,
        Contect_number: true,
        Rating: true,
        Description: true,
        Charges_PerHour: true,
        Charges_PerVisit: true,

        worker_image: true,
        video: true,
        review: {
          select: {
            id: true,
            Name: true,
            img_URL: true,
            video_URL: true,
            Comment: true
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
