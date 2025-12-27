import { PrismaClient } from "@prisma/client";
import { Router, Response } from "express";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const client_Settings = Router();


// ======================================================
// 1. GET LANGUAGE (App Language Screen)
// ======================================================
client_Settings.get("/settings/me/language", userAuth, async (req: any, res: Response) => {
    try {
        const clientId = req.user.id;

        const settings = await prisma.clientSettings.findUnique({
            where: { clientId: clientId },
            select: { AppLanguage: true }
        });

        if (!settings) {
            return res.status(404).json({ message: "Settings not found" });
        }

        res.json(settings);
    } catch (err) {
        res.status(500).json({ message: "Internal server error" });
    }
});


// ======================================================
// 2. UPDATE LANGUAGE
// ======================================================
client_Settings.put("/settings/me/language", userAuth, async (req: any, res: Response) => {
    try {
        const clientId = req.user.id;
        const { App_Language } = req.body;

        if (!App_Language) {
            return res.status(400).json({ message: "App_Language is required" });
        }

        const update = await prisma.clientSettings.update({
            where: { clientId: clientId },
            data: { AppLanguage: App_Language },
            select: { AppLanguage: true }
        });

        res.json(update);
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


// ======================================================
// 3. INVITE A FRIEND (Referral Code Screen)
// ======================================================
client_Settings.get("/settings/me/invite", userAuth, async (req: any, res: Response) => {
    try {
        const clientId = req.user.id;

        const settings = await prisma.clientSettings.findUnique({
            where: { clientId: clientId },
            select: { ReferCode: true }
        });

        if (!settings) {
            return res.status(404).json({ message: "Settings not found" });
        }

        res.json(settings);   // returns: { "ReferCode": 123456 }
    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Internal server error" });
    }
});


export default client_Settings;
