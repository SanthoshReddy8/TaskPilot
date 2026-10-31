import type { NextFunction, Request, Response } from "express";

const safeMethods = new Set(["GET", "HEAD", "OPTIONS"]);

export function csrfProtection(clientOrigin: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (safeMethods.has(req.method)) {
      next();
      return;
    }

    if (req.get("origin") !== clientOrigin || req.get("sec-fetch-site") === "cross-site") {
      res.status(403).json({ error: "Request origin is not allowed" });
      return;
    }

    next();
  };
}
