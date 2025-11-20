import { Router,Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const worker_profile = Router();


// ====================== 1. GET PROFILE ======================
worker_profile.get("/profile/me", userAuth, async (req: any, res: Response) => {
    try {
        const workerId = req.user.id;

        const data = await prisma.worker.findUnique({
            where: { id: workerId },
            include: {
                worker_image: true,
                video: true,
                review: true
            }
        });

        if (!data) {
            return res.status(404).json({ message: "Worker not found" });
        }

        res.json(data);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// ====================== 2. UPDATE PROFILE ======================
worker_profile.put("/profile/me", userAuth, async (req: any, res: Response) => {
    try {
        const workerId = req.user.id;

        const {
            Name,
            ImgURL,
            Contect_number,
            Description,
            Charges_PerHour,
            Charges_PerVisit
        } = req.body;

        const dataToUpdate: any = {};

        if (Name !== undefined) dataToUpdate.Name = Name;
        if (ImgURL !== undefined) dataToUpdate.ImgURL = ImgURL;
        if (Contect_number !== undefined) dataToUpdate.Contect_number = Contect_number;
        if (Description !== undefined) dataToUpdate.Description = Description;
        if (Charges_PerHour !== undefined) dataToUpdate.Charges_PerHour = Charges_PerHour;
        if (Charges_PerVisit !== undefined) dataToUpdate.Charges_PerVisit = Charges_PerVisit;

        const data = await prisma.worker.update({
            where: { id: workerId },
            data: dataToUpdate
        });

        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});



// ====================== 3. GET IMAGES ======================
worker_profile.get("/profile/me/images", userAuth, async (req: any, res: Response) => {
    const data = await prisma.worker_image.findMany({
        where: { worker_Id: req.user.id }
    });
    res.json(data);
});


// ====================== 4. ADD IMAGE ======================
worker_profile.post("/profile/me/images", userAuth, async (req: any, res: Response) => {
    try {
        const data = await prisma.worker_image.create({
            data: {
                worker_Id: req.user.id,
                name: req.body.name,       // required
                img_URL: req.body.img_URL  // URL from Cloudinary
            }
        });

        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to upload image" });
    }
});


// ====================== 5. ADD VIDEO ======================
worker_profile.post("/profile/me/videos", userAuth, async (req: any, res: Response) => {
    try {
        const data = await prisma.worker_Video.create({
            data: {
                worker_Id: req.user.id,
                Name: req.body.Name,
                Video_URL: req.body.Video_URL
            }
        });

        res.json(data);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Failed to upload video" });
    }
});


// ====================== 6. GET VIDEOS ======================
worker_profile.get("/profile/me/videos", userAuth, async (req: any, res: Response) => {
    const data = await prisma.worker_Video.findMany({
        where: { worker_Id: req.user.id }
    });
    res.json(data);
});


// ====================== 7. GET REVIEWS ======================
worker_profile.get("/profile/me/reviews", userAuth, async (req: any, res: Response) => {
    const data = await prisma.review.findMany({
        where: { worker_Id: req.user.id }
    });
    res.json(data);
});

export default worker_profile;
