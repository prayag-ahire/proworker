import { Request, Response, NextFunction } from "express";
import jwt, { Secret } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { hashToken } from "../utils/sessionUtils";

const prisma = new PrismaClient();

interface JwtPayload {
  userId: number;
  role: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const userAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ msg: "Authorization denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const secret: Secret = (process.env.JWT_SECRET || "SkillSecret") as Secret;
    const decoded = jwt.verify(
      token,
      secret
    ) as JwtPayload;

    if (!decoded.userId) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    // Verify token exists in database (single session check)
    const tokenHash = hashToken(token);
    let session = null;

    if (decoded.role === "client") {
      session = await prisma.clientSession.findUnique({
        where: { tokenHash }
      });
    } else if (decoded.role === "worker") {
      session = await prisma.workerSession.findUnique({
        where: { tokenHash }
      });
    }

    // Token not found in database or expired
    if (!session || session.expiresAt < new Date()) {
      return res.status(401).json({ msg: "Session expired or invalid" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};

export default userAuth;