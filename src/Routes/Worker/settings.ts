import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const worker_Settings = Router();

// ====================== GET SETTINGS ======================
worker_Settings.get("/settings/me", userAuth, async (req: any, res) => {
    try {
        const workerId = req.user.id;

        const settings = await prisma.worker_Settings.findUnique({
            where: { Worker_Id: workerId },
            include: {
                location: true,
            }
        });

        if (!settings) {
            return res.status(404).json({ message: "Settings not found" });
        }

        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// ===================== UPDATE Language =====================
worker_Settings.put("/settings/me/language", userAuth, async (req: any, res) => {
    try {
        const workerId = req.user.id;
        const { App_Language } = req.body;

        if (!App_Language) {
            return res.status(400).json({ message: "App_Language is required" });
        }

        const update = await prisma.worker_Settings.update({
            where: { Worker_Id: workerId },
            data: { App_Language }
        });

        res.json(update);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

//==================== UPDATE LOCATION =====================
worker_Settings.put("/settings/me/location", userAuth, async (req: any, res) => {
    try {
        const workerId = req.user.id;
        const { latitude, longitude } = req.body;

        if (!latitude || !longitude) {
            return res.status(400).json({ message: "Latitude & Longitude are required" });
        }

        const settings = await prisma.worker_Settings.findUnique({
            where: { Worker_Id: workerId }
        });

        if (!settings) {
            return res.status(404).json({ message: "Settings not found" });
        }

        const location = await prisma.location.upsert({
            where: { Worker_Settings_Id: settings.id },
            update: { latitude, longitude },
            create: {
                Worker_Settings_Id: settings.id,
                latitude,
                longitude,
            },
        });

        res.json(location);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});

//==================== Get Training status =====================
worker_Settings.get("/settings/me/training", userAuth, async (req: any, res) => {
    const workerId = req.user.id;

    const training = await prisma.worker_Training.findMany({
        where: { Worker_id: workerId },
        include: {
            video: true
        }
    });

    res.json(training);
});

//==================== Update Training status =====================
worker_Settings.put("/settings/me/training/:id", userAuth, async (req: any, res) => {
    try {
        const trainingId = Number(req.params.id);
        const { Status } = req.body;

        const update = await prisma.worker_Training.update({
            where: { id: trainingId },
            data: { Status }
        });

        res.json(update);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});

export default worker_Settings;