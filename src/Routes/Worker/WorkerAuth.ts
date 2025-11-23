import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();


// ====================== WORKER SIGNUP ======================
router.post("/signup", async (req, res) => {
  try {
    const { Name, Contect_number, Password } = req.body;

    const hashed = await bcrypt.hash(Password, 10);

    const worker = await prisma.worker.create({
      data: {
        Name,
        Contact_number: Contect_number,
        ImgURL: "",
        Password: hashed,
        Rating: 0,
        Description: "",
        Charges_PerHour: 0,
        Charges_PerVisit: 0,
        ReferCode: Math.floor(100000 + Math.random() * 900000),
        ReferenceId: 0, 
      },
    });

    await prisma.workerSettings.create({
      data: {
        workerId: worker.id,
        AppLanguage: "English",
        ReferCode: worker.ReferCode,
        ReferenceId: 0,
      },
    });

    const token = jwt.sign(
      { id: worker.id, role: "worker" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    res.json({ token, worker });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup failed" });
  }
});


// ====================== WORKER LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { Contect_number, Password } = req.body;

    const worker = await prisma.worker.findUnique({
      where: { Contact_number: Contect_number }
    });

    if (!worker) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(Password, worker.Password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: worker.id, role: "worker" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    res.json({ token, worker });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
