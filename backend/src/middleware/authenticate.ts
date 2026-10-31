import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { getJwtSecret } from "../services/authService";

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const token: unknown = req.cookies?.taskflow_token;
  if (typeof token !== "string") {
    res.status(401).json({ error: "Authentication required" });
    return;
  }

  try {
    const payload = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] });
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }

    req.userId = payload.sub;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({ error: "Invalid or expired session" });
      return;
    }
    next(error);
  }
}
