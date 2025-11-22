import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";


const prisma = new PrismaClient();
const ReviewRouter = Router();

// POST REVIEW
ReviewRouter.post("/Review/:orderId", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;
    const orderId = Number(req.params.orderId);
    const { Name, Comment, images = [], videos = [] } = req.body;

    if (!Comment || Comment.trim() === "") {
      return res.status(400).json({ message: "Comment is required" });
    }

    // 1. Find the order
    const order = await prisma.worker_Order.findUnique({
      where: { id: orderId },
      include: { worker: true, client: true }
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    // 2. Ensure order belongs to logged-in client
    if (order.Client_Id !== clientId) {
      return res.status(403).json({ message: "Unauthorized to review this order" });
    }

    // 3. Ensure order is completed
    if (order.Work_Status !== "completed") {
      return res.status(400).json({ message: "You can review only completed orders" });
    }

    // 4. Ensure no previous review for this order
    const existing = await prisma.review.findFirst({
      where: { Order_Id: orderId }
    });

    if (existing) {
      return res.status(400).json({ message: "Review already submitted for this order" });
    }

    // 5. Create review
    const review = await prisma.review.create({
      data: {
        Name,
        Comment,
        worker_Id: order.worker_Id,
        Client_Id: clientId,
        Order_Id: orderId
      }
    });

    // 6. Insert images
    if (images.length > 0) {
      await prisma.review_Image.createMany({
        data: images.map((url: string) => ({
          review_Id: review.id,
          img_URL: url
        }))
      });
    }

    // 7. Insert videos
    if (videos.length > 0) {
      await prisma.review_Video.createMany({
        data: videos.map((url: string) => ({
          review_Id: review.id,
          video_URL: url
        }))
      });
    }

    return res.json({
      message: "Review submitted successfully",
      reviewId: review.id
    });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

ReviewRouter.get("/Review/my", userAuth, async (req: any, res: Response) => {
  try {
    const clientId = req.user.id;

    const reviews = await prisma.review.findMany({
      where: { Client_Id: clientId },
      orderBy: { createdAt: "desc" },
      include: {
        worker: { select: { Name: true, ImgURL: true } },
        order: { select: { id: true, date: true, time: true } },
      }
    });

    return res.json(reviews);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

ReviewRouter.get("/Review/:id", userAuth, async (req: any, res: Response) => {
  try {
    const reviewId = Number(req.params.id);
    const clientId = req.user.id;

    const review = await prisma.review.findUnique({
      where: { id: reviewId },
      include: {
        worker: {
          select: {
            Name: true,
            ImgURL: true,
          }
        },
        order: {
          select: {
            id: true,
            date: true,
            time: true
          }
        },
        images: true,
        videos: true,
        Comment: true,
      }
    });

    if (!review) {
      return res.status(404).json({ message: "Review not found" });
    }

    // prevent accessing other user's reviews
    if (review.Client_Id !== clientId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    return res.json(review);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
});

export default ReviewRouter;
