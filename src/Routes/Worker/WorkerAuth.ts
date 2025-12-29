import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";
import { 
  invalidateAllUserSessions, 
  createSession 
} from "../../utils/sessionUtils";

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

    // Create first session for new user
    const token = await createSession(user.id, "worker");

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

    // Invalidate all existing sessions (single session support)
    await invalidateAllUserSessions(user.id, "worker");

    // Create new session
    const token = await createSession(user.id, "worker");

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
  const userId = req.user.userId;
  const {
    username,
    ImgURL,
    Email,
    Age,
    gender,
    profession,
    Description,
    Charges_PerVisit,
    Distance_charges,
    ReferenceId
  } = req.body;

  try {
    // 🔒 Prevent duplicate profile creation
    const existingWorker = await prisma.worker.findUnique({
      where: { userId }
    });

    if (existingWorker) {
      return res.status(409).json({
        message: "Worker profile already exists"
      });
    }

    // 🔐 Atomic operation
    const worker = await prisma.worker.create({
      data: {
        userId,
        username,
        ImgURL,
        Email,
        Age,
        gender,
        profession,
        Description,
        Charges_PerVisit: Number(Charges_PerVisit),
        Distance_charges: Number(Distance_charges),
        settings: {
          create: {
            AppLanguage: "English",
            ReferCode: Math.floor(100000 + Math.random() * 900000),
            ReferenceId: ReferenceId || 0
          }
        }
      },
      select:{
        id: true
      }
    });

    await prisma.worker_User.update({
      where: { id: userId },
      data: { profileCompleted: true }
    });

    await prisma.weekSchedule.create({
      data: {
        workerId: worker.id
      }
    });

    res.json(worker);

  } catch (err: any) {
    console.error("Worker profile creation failed:", err);

    if (err.code === "P2002") {
      return res.status(409).json({
        message: "Worker profile already exists"
      });
    }

    res.status(500).json({
      message: "Profile creation failed"
    });
  }
});

// ====================== WORKER LOGOUT ======================
router.post("/logout", userAuth, async (req: any, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const { invalidateToken } = await import("../../utils/sessionUtils");
    await invalidateToken(token);

    return res.json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Logout failed" });
  }
});

export default router;
