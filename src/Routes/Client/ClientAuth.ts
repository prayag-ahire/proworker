import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const router = Router();

// ====================== CLIENT SIGNUP ======================
router.post("/signup", async (req, res) => {
  try {
    // Accept incoming fields exactly like the client sends
    const { name, Contect_number, Password, refarid } = req.body;

    // --- Basic validation ---
    if (!name || !Contect_number || !Password) {
      return res.status(400).json({ message: "name, Contect_number and Password are required" });
    }

    // Normalize values (trim strings)
    const contact = String(Contect_number).trim();
    const referId = refarid !== undefined && refarid !== null ? Number(refarid) : 0;

    // --- Check duplicate phone (Contact_number is now a STRING in your schema) ---
    const exists = await prisma.client.findUnique({
      where: { Contact_number: contact }
    });

    if (exists) {
      return res.status(400).json({ message: "Phone number already registered" });
    }

    // --- Hash password ---
    const hashed = await bcrypt.hash(Password, 10);

    // --- Create client ---
    const client = await prisma.client.create({
      data: {
        name,
        Contact_number: contact, // matches schema now (string)
        ImgURL: "",
        Password: hashed,
      },
    });

    // --- Create settings row (clientSettings model) ---
    await prisma.clientSettings.create({
      data: {
        clientId: client.id,
        AppLanguage: "English",
        ReferCode: Math.floor(100000 + Math.random() * 900000),
        ReferenceId: Number.isInteger(referId) ? referId : 0,
      },
    });

    // --- JWT token ---
    const token = jwt.sign(
      { id: client.id, role: "client" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    // return created client (it's safe now because Contact_number is string)
    return res.json({ token, client });

  } catch (err: any) {
    console.error("Signup error:", err);
    // If unique constraint or validation from Prisma, send helpful message
    if (err?.code === "P2002") {
      return res.status(400).json({ message: "Duplicate value error", meta: err.meta });
    }
    return res.status(500).json({ message: "Signup failed", error: err.message });
  }
});


// ====================== CLIENT LOGIN ======================
router.post("/login", async (req, res) => {
  try {
    const { Contect_number, Password } = req.body;

    // 1. Find the user
    const client = await prisma.client.findUnique({
      where: { Contact_number: Contect_number }
    });

    if (!client) {
      return res.status(400).json({ message: "User not found" });
    }

    // 2. Validate password
    const match = await bcrypt.compare(Password, client.Password);
    if (!match) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 3. JWT token
    const token = jwt.sign(
      { id: client.id, role: "client" },
      "SkillSecret",
      { expiresIn: "7d" }
    );

    return res.json({ token, client });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Login failed" });
  }
});

export default router;
