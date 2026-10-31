import { Router } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/health", async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      ok: true,
      service: "taskflow-api",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch {
    res.status(503).json({
      ok: false,
      service: "taskflow-api",
      database: "disconnected",
      timestamp: new Date().toISOString(),
    });
  }
});

export default router;
