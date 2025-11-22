import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  user?: any;
}

export const userAuth = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ msg: "Authorization denied" });
  }

  try {
    const decoded = jwt.verify(token, "SkillSecret");
    req.user = decoded;
    next();
  } catch (err) {
    console.error(err);
    return res.status(401).json({ msg: "Token is not valid" });
  }
};
