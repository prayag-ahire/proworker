import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const router = Router();

// ====================== WORKER SIGNUP ======================
router.post("/signup", async (req, res) => {
  try {
    const { phone_no, password } = req.body;

    // Check if already exists
    const exists = await prisma.worker_User.findUnique({
      where: { phone_no }
    });

    if (exists) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create auth account
    const user = await prisma.worker_User.create({
      data: {
        phone_no,
        password: hashedPassword
      }
    });

    // Token
    const token = jwt.sign(
      { userId: user.id, role: "worker" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      profileCompleted: user.profileCompleted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// ====================== WORKER LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { phone_no, password } = req.body;

    const user = await prisma.worker_User.findUnique({
      where: { phone_no }
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: "worker" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    res.json({
      token,
      profileCompleted: user.profileCompleted
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Login failed" });
  }
});


router.post("/workerProfile", userAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const {
      username,
      ImgURL,
      profession,
      Description,
      Charges_PerVisit
    } = req.body;

    // Create worker profile
    const worker = await prisma.worker.create({
      data: {
        userId,
        username,
        ImgURL,
        profession,
        Description,
        Charges_PerVisit: Number(Charges_PerVisit)
      }
    });

    // Create worker settings
    await prisma.workerSettings.create({
      data: {
        workerId: worker.id,
        AppLanguage: "English",
        ReferCode: Math.floor(100000 + Math.random() * 900000),
        ReferenceId: 0
      }
    });

    // Mark profile completed
    await prisma.worker_User.update({
      where: { id: userId },
      data: { profileCompleted: true }
    });

    res.json(worker);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Profile creation failed" });
  }
});


export default router;
