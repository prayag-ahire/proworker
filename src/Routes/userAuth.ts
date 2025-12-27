import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
  role: string;
}

interface AuthRequest extends Request {
  user?: JwtPayload;
}

export const userAuth = (
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
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "SkillSecret"
    ) as JwtPayload;

    // Optional role check (future-proof)
    if (!decoded.userId) {
      return res.status(401).json({ msg: "Invalid token payload" });
    }

    req.user = decoded;
    next();

  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
export default userAuth;