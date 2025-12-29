import crypto from "crypto";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Hash a JWT token for secure storage in database
 */
export function hashToken(token: string): string {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

/**
 * Invalidate all existing sessions for a user
 */
export async function invalidateAllUserSessions(
  userId: number,
  userType: "client" | "worker"
): Promise<void> {
  if (userType === "client") {
    await prisma.clientSession.deleteMany({
      where: { clientId: userId }
    });
  } else {
    await prisma.workerSession.deleteMany({
      where: { workerId: userId }
    });
  }
}

/**
 * Create a new session token and store it in database
 */
export async function createSession(
  userId: number,
  userType: "client" | "worker",
  expiresIn: SignOptions["expiresIn"] = "7d"
): Promise<string> {

  const secret = process.env.JWT_SECRET ?? "SkillSecret";

  const payload = {
    userId,
    role: userType
  };

  const token = jwt.sign(payload, secret, {
    expiresIn
  });

  const decoded = jwt.decode(token) as JwtPayload;

  if (!decoded?.exp) {
    throw new Error("Invalid JWT token");
  }

  const expiresAt = new Date(decoded.exp * 1000);
  const tokenHash = hashToken(token);

  if (userType === "client") {
    await prisma.clientSession.create({
      data: {
        clientId: userId,
        tokenHash,
        expiresAt
      }
    });
  } else {
    await prisma.workerSession.create({
      data: {
        workerId: userId,
        tokenHash,
        expiresAt
      }
    });
  }

  return token;
}

/**
 * Verify if a token is valid and exists in the database
 */
export async function verifyTokenSession(
  token: string,
  userType: "client" | "worker"
): Promise<{ valid: boolean; userId?: number }> {

  try {
    const secret = process.env.JWT_SECRET ?? "SkillSecret";

    const decoded = jwt.verify(token, secret) as JwtPayload & {
      userId: number;
      role: string;
    };

    const tokenHash = hashToken(token);

    if (userType === "client") {
      const session = await prisma.clientSession.findUnique({
        where: { tokenHash }
      });

      if (session && session.expiresAt > new Date()) {
        return { valid: true, userId: session.clientId };
      }
    } else {
      const session = await prisma.workerSession.findUnique({
        where: { tokenHash }
      });

      if (session && session.expiresAt > new Date()) {
        return { valid: true, userId: session.workerId };
      }
    }

    return { valid: false };
  } catch {
    return { valid: false };
  }
}

/**
 * Invalidate a specific token (logout)
 */
export async function invalidateToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);

  await Promise.all([
    prisma.clientSession.deleteMany({
      where: { tokenHash }
    }),
    prisma.workerSession.deleteMany({
      where: { tokenHash }
    })
  ]);
}
