// worker_settings.ts
import { PrismaClient } from "@prisma/client";
import { Router, Response } from "express";
import { userAuth } from "../userAuth";

enum App_Language{
  English,
  Hindi,
  Marathi,
  Gujarati
}

const prisma = new PrismaClient();
const worker_Settings = Router();

// LOCATION endpoints (Location screen)
// GET location only (location screen can call this)
worker_Settings.get("/settings/me/location", userAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId; 

    const worker = await prisma.worker.findUnique({
    where: { userId },
    select: {
      settings: {
        select: { location: true }
        }
      }
    });

if (!worker || !worker.settings) {
  return res.status(404).json({ message: "Settings not found" });
}

res.json(worker.settings.location ?? null);


  } catch (err) {
    console.error("Get location error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// PUT upsert location (set / update)
worker_Settings.put("/settings/me/location", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const { latitude, longitude } = req.body;

    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return res.status(400).json({
        message: "latitude and longitude must be numbers",
      });
    }

    const settings = await prisma.worker.findUnique({
      where: { userId: workerId },
      select: {
        settings: {
          select: { id: true }
        }
      }
    });

    if (!settings || !settings.settings || typeof settings.settings.id !== "number") {
      return res.status(404).json({ message: "Worker Settings not found" });
    }

    const location = await prisma.location.upsert({
      where: { workerSettingsId: settings.settings.id },
      update: { latitude, longitude },
      create: {
        workerSettingsId: settings.settings.id,
        latitude,
        longitude,
      },
    });

    res.json(location);

  } catch (err) {
    console.error("Update location error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ LANGUAGE endpoints (App Language screen) ------------------
// GET language (small call)
worker_Settings.get("/settings/me/language", userAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const worker = await prisma.worker.findUnique({
      where: { userId },
      select: {
        settings: {
          select: { AppLanguage: true },
        },
      },
    });

    if (!worker || !worker.settings) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.json(worker.settings);

  } catch (err) {
    console.error("Get language error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});


// PUT language
worker_Settings.put("/settings/me/language", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
    const { App_Language: appLanguage } = req.body;
    
    if (!appLanguage || !Object.values(App_Language).includes(appLanguage)) {
        return res.status(400).json({
          message: "Valid AppLanguage is required",
        });
      }

       const settings = await prisma.worker.findUnique({
        where: { userId: workerId },
        select: {
          settings: {
            select: { id: true }
          }
        }
      });

      if (!settings) {
        return res.status(404).json({
          message: "Worker settings not found",
        });
      }

    const update = await prisma.workerSettings.update({
      where: { id: settings.settings?.id },
      data: { AppLanguage: appLanguage },
      select: { AppLanguage: true },
    });

    res.json(update);
  } catch (err) {
    console.error("Update language error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ INVITE (Invite screen) ------------------
// GET referral code only (Invite screen)
worker_Settings.get("/settings/me/invite", userAuth, async (req: any, res: Response) => {
  try {
    const userId = req.user.userId;

    const worker = await prisma.worker.findUnique({
      where: { userId: userId },
      select: {
        settings: {
          select: {
            ReferCode:true,
          }
        }
      }
    });

if (!worker || !worker.settings) {
  return res.status(404).json({ message: "Settings not found" });
}

return res.json(worker.settings);

  } catch (err) {
    console.error("Get invite code error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ------------------ TRAINING (Tutorial Videos screen) ------------------
// GET training list + video details
worker_Settings.get("/settings/me/training", userAuth, async (req: any, res: Response) => {
  try {
    const workerId = req.user.userId;
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
    const workerId = req.user.userId;
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

// the language and invite tested and properly working
