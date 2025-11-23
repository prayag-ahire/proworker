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

    // 1. Check if phone already registered
    const exists = await prisma.worker.findUnique({
      where: { Contact_number: Contect_number }
    });

    if (exists) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // 2. Hash password
    const hashed = await bcrypt.hash(Password, 10);

    // 3. Create worker
    const worker = await prisma.worker.create({
      data: {
        Name,
        Contact_number: Contect_number,
        ImgURL: "",
        Password: hashed,
        Rating: 0,
        profession: "",
        Description: "",
        Charges_PerHour: 0,
        Charges_PerVisit: 0,
        ReferCode: Math.floor(100000 + Math.random() * 900000),
        ReferenceId: 0,
      },
    });

    // 4. Create worker settings
    await prisma.workerSettings.create({
      data: {
        workerId: worker.id,
        AppLanguage: "English",
        ReferCode: worker.ReferCode,
        ReferenceId: 0,
      },
    });

    // 5. JWT
    const token = jwt.sign(
      { id: worker.id, role: "worker" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    return res.json({ token, worker });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ====================== WORKER LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { Contect_number, Password } = req.body;

    // 1. Find worker
    const worker = await prisma.worker.findUnique({
      where: { Contact_number: Contect_number }
    });

    if (!worker) {
      return res.status(400).json({ message: "Worker not found" });
    }

    // 2. Check password
    const match = await bcrypt.compare(Password, worker.Password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. Generate token
    const token = jwt.sign(
      { id: worker.id, role: "worker" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    return res.json({ token, worker });

  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
});

export default router;
