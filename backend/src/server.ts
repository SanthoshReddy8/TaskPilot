import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import express from "express";
import path from "path";
import { csrfProtection } from "./middleware/csrfProtection";
import { AuthError, getJwtSecret } from "./services/authService";
import authRouter from "./routes/auth";
import healthRouter from "./routes/health";
import { prisma } from "./lib/prisma";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const app = express();
const port = Number(process.env.PORT) || 5000;
const clientOrigin = process.env.CLIENT_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);
app.use(cookieParser());
app.use(express.json());
app.use("/api", csrfProtection(clientOrigin));

app.use("/api", healthRouter);
app.use("/api/auth", authRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((error: unknown, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  if (error instanceof AuthError) {
    res.status(error.status).json({ error: error.message });
    return;
  }

  if (error instanceof SyntaxError && "status" in error && error.status === 400) {
    res.status(400).json({ error: "Invalid JSON request body" });
    return;
  }

  console.error("Unhandled API error:", error);
  res.status(500).json({ error: "Internal server error" });
});

async function start() {
  try {
    getJwtSecret();
    await prisma.$connect();
    console.log("Connected to PostgreSQL");
  } catch (error) {
    console.error("Failed to start API:", error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`API listening on http://localhost:${port}`);
  });
}

start();
