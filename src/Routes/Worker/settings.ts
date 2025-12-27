// worker_settings.ts
import { PrismaClient } from "@prisma/client";
import { Router, Response } from "express";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const worker_Settings = Router();

// ------------------ LOCATION endpoints (Location screen) ------------------
// GET location only (location screen can call this)
worker_Settings.get("/settings/me/location", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const settings = await prisma.workerSettings.findUnique({
      where: { workerId: workerId },
      include: { location: true },
    });
    if (!settings) return res.status(404).json({ message: "Settings not found" });

    res.json(settings.location ?? null);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT upsert location (set / update)
worker_Settings.put("/settings/me/location", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const { latitude, longitude } = req.body;

    if (latitude === undefined || longitude === undefined) {
      return res.status(400).json({ message: "latitude & longitude are required" });
    }

    const settings = await prisma.workerSettings.findUnique({
      where: { workerId: workerId },
    });
    if (!settings) return res.status(404).json({ message: "Settings not found" });

    const location = await prisma.location.upsert({
      where: { workerSettingsId: settings.id },
      update: { latitude, longitude },
      create: {
        workerSettingsId: settings.id,
        latitude,
        longitude,
      },
    });

    res.json(location);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ LANGUAGE endpoints (App Language screen) ------------------
// GET language (small call)
worker_Settings.get("/settings/me/language", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const settings = await prisma.workerSettings.findUnique({
      where: { workerId: workerId },
      select: { AppLanguage: true },
    });

    if (!settings) return res.status(404).json({ message: "Settings not found" });
    res.json(settings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT language
worker_Settings.put("/settings/me/language", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const { App_Language } = req.body;
    if (!App_Language) return res.status(400).json({ message: "App_Language is required" });

    const update = await prisma.workerSettings.update({
      where: { workerId: workerId },
      data: { AppLanguage: App_Language },
      select: { AppLanguage: true },
    });

    res.json(update);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ INVITE (Invite screen) ------------------
// GET referral code only (Invite screen)
worker_Settings.get("/settings/me/invite", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const settings = await prisma.workerSettings.findUnique({
      where: { workerId: workerId },
      select: { ReferCode: true },
    });
    if (!settings) return res.status(404).json({ message: "Settings not found" });

    res.json(settings); // { ReferCode: 123456 }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ TRAINING (Tutorial Videos screen) ------------------
// GET training list + video details
worker_Settings.get("/settings/me/training", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const training = await prisma.workerTraining.findMany({
      where: { workerId: workerId },
      include: { video: true },
    });
    res.json(training);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT update training status for a specific training record
worker_Settings.put("/settings/me/training/:id", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.id;
    const trainingId = Number(req.params.id);
    const { Status } = req.body;

    if (typeof Status !== "boolean") {
      return res.status(400).json({ message: "Status must be boolean" });
    }

    const updated = await prisma.workerTraining.updateMany({
      where: {
        id: trainingId,
        workerId: workerId,  // Ensure the record belongs to the logged-in worker
      },
      data: { Status }
    });

    if (updated.count === 0) {
      return res.status(404).json({ message: "Training not found or not assigned to this worker" });
    }

    res.json({ message: "Training status updated successfully" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});


export default worker_Settings;
