import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: number;
}

export interface AuthenticatedRequest extends Request {
  userId?: number;
}

export const authenticateToken = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Niste autentifikovani.",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token nije pronađen.",
      });
    }

    const secret = process.env.JWT_SECRET;

    if (!secret) {
      console.error("JWT_SECRET nije podešen.");

      return res.status(500).json({
        message: "Server configuration error.",
      });
    }

    const decoded = jwt.verify(token, secret) as JwtPayload;

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);

    return res.status(401).json({
      message: "Nevažeći ili istekao token.",
    });
  }
};
