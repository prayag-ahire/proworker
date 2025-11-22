import { Response , Router} from "express"
import { userAuth } from "../userAuth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const Review = Router();

Review.post("/review/:orderId", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;
    const orderId = Number(req.params.orderId);

    const { comment, img_URL, video_URL } = req.body;

    if (!comment || comment.trim() === "") {
      return res.status(400).json({ message: "Comment is required" });
    }

    // 1. Validate order belongs to this client
    const order = await prisma.worker_Order.findFirst({
      where: {
        id: orderId,
        Client_Id: clientId,
        Work_Status: "completed"
      }
    });

    if (!order) {
      return res.status(400).json({ message: "Invalid or incomplete order" });
    }

    // 2. Check if review already exists FOR THIS ORDER
    const exists = await prisma.review.findFirst({
      where: { Order_Id: orderId }    // FIXED 
    });

    if (exists) {
      return res.status(400).json({ message: "Review already submitted for this order" });
    }

    // 3. Create review
    const review = await prisma.review.create({
      data: {
        Name: req.user.name,
        Comment: comment,
        img_URL: img_URL || null,
        video_URL: video_URL || null,
        worker_Id: order.worker_Id,
        Client_Id: clientId,
        Order_Id: orderId
      }
    });

    return res.json({
      message: "Review submitted successfully",
      review
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});


Review.get("/review/me", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;

    const reviews = await prisma.review.findMany({
      where: { Client_Id: clientId },
      orderBy: { id: "desc" },
      include: {
        worker: {
          select: {
            id: true,
            Name: true,
            ImgURL: true,
            Rating: true
          }
        }
      }
    });

    return res.json({ reviews });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

// ====================== GET SINGLE REVIEW ======================
Review.get("/review/:id", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;
    const reviewId = Number(req.params.id);

    const review = await prisma.review.findFirst({
      where: {
        id: reviewId,
        Client_Id: clientId   // ensure it's THEIR review
      },
      include: {
        worker: {
          select: {
            id: true,
            Name: true,
            ImgURL: true,
            Rating: true,
            Description: true
          }
        }
      }
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    return res.json(review);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
module.exports = Review ;
