import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();


// ====================== CLIENT SIGNUP ======================
router.post("/signup", async (req, res) => {
  try {
    const { name, Contect_number, Password,refarid } = req.body;

    const hashed = await bcrypt.hash(Password, 10);

    const client = await prisma.client.create({
      data: {
        name,
        Contact_number: Contect_number,
        ImgURL: "",
        Password: hashed,
      },
    });

    await prisma.clientSettings.create({
      data: {
        clientId: client.id,
        AppLanguage: "English",
        ReferCode: Math.floor(100000 + Math.random() * 900000),
        ReferenceId: refarid,
      },
    });

    const token = jwt.sign(
      { id: client.id, role: "client" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    res.json({ token, client });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Signup failed" });
  }
});


// ====================== CLIENT LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { Contect_number, Password } = req.body;

    const client = await prisma.client.findUnique({
      where: { Contact_number: Contect_number }
    });

    if (!client) {
      return res.status(400).json({ message: "User not found" });
    }

    const match = await bcrypt.compare(Password, client.Password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: client.id, role: "client" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    res.json({ token, client });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Login failed" });
  }
});


export default router;
