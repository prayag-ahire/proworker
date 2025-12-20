import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { userAuth } from "../userAuth";

const prisma = new PrismaClient();
const router = Router();

// ====================== CLIENT SIGNUP ======================
router.post("/signup", async (req, res) => {
  try {
    const { Contect_number, Password } = req.body;

    if (!Contect_number || !Password) {
      return res.status(400).json({ message: "Phone & Password are required" });
    }

    const phone = String(Contect_number).trim();

    const exists = await prisma.client_User.findUnique({
      where: { phone_no: phone }
    });

    if (exists) {
      return res.status(400).json({ message: "Phone already registered" });
    }

    const hashed = await bcrypt.hash(Password, 10);

    const user = await prisma.client_User.create({
      data: {
        phone_no: phone,
        password: hashed
      }
    });

    const token = jwt.sign(
      { userId: user.id, role: "client" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      profileCompleted: user.Profile_Completed
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Signup failed" });
  }
});



// ====================== CLIENT LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { Contect_number, Password } = req.body;

    const phone = String(Contect_number).trim();

    const user = await prisma.client_User.findUnique({
      where: { phone_no: phone }
    });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(Password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { userId: user.id, role: "client" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    return res.json({
      token,
      profileCompleted: user.Profile_Completed
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

// ====================== UPDATE CLIENT PROFILE ======================
router.post("/clientProfile", userAuth, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { username, ImgURL, age, email, gender } = req.body;

    // Prevent duplicate profile
    const exists = await prisma.client.findUnique({
      where: { userId }
    });

    if (exists) {
      return res.status(400).json({ message: "Profile already exists" });
    }

    const client = await prisma.client.create({
      data: {
        userId,
        username,
        ImgURL,
        age: Number(age),
        email,
        gender
      }
    });

    await prisma.clientSettings.create({
      data: {
        clientId: client.id,
        AppLanguage: "English",
        ReferCode: Math.floor(100000 + Math.random() * 900000),
        ReferenceId: 0
      }
    });

    await prisma.client_User.update({
      where: { id: userId },
      data: { Profile_Completed: true }
    });

    return res.json(client);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Profile creation failed" });
  }
});

export default router;
