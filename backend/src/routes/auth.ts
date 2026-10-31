import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import { AuthError, authTokenLifetimeSeconds, findPublicUser, loginUser, registerUser } from "../services/authService";

const router = Router();
const cookieName = "taskflow_token";

function cookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? ("none" as const) : ("lax" as const),
    path: "/api",
  };
}

function readCredentials(body: unknown) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new AuthError("A JSON request body is required", 400);
  }

  const input = body as Record<string, unknown>;
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (name.length < 1 || name.length > 80) {
    throw new AuthError("Name must be between 1 and 80 characters", 400);
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new AuthError("A valid email address is required", 400);
  }
  if (password.length < 12 || Buffer.byteLength(password, "utf8") > 72) {
    throw new AuthError("Password must be at least 12 characters and no more than 72 bytes", 400);
  }

  return { name, email, password };
}

function readLoginCredentials(body: unknown) {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new AuthError("A JSON request body is required", 400);
  }

  const input = body as Record<string, unknown>;
  const email = typeof input.email === "string" ? input.email.trim().toLowerCase() : "";
  const password = typeof input.password === "string" ? input.password : "";

  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length === 0) {
    throw new AuthError("A valid email and password are required", 400);
  }

  return { email, password };
}

router.post("/register", async (req, res, next) => {
  try {
    const { name, email, password } = readCredentials(req.body);
    const { user, token } = await registerUser(name, email, password);
    res.cookie(cookieName, token, {
      ...cookieOptions(),
      maxAge: authTokenLifetimeSeconds * 1000,
    });
    res.status(201).json({ user });
  } catch (error) {
    next(error);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = readLoginCredentials(req.body);
    const { user, token } = await loginUser(email, password);
    res.cookie(cookieName, token, {
      ...cookieOptions(),
      maxAge: authTokenLifetimeSeconds * 1000,
    });
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.get("/me", authenticate, async (req, res, next) => {
  try {
    if (!req.userId) {
      throw new AuthError("Authentication required", 401);
    }
    const user = await findPublicUser(req.userId);
    res.json({ user });
  } catch (error) {
    next(error);
  }
});

router.post("/logout", (_req, res) => {
  res.clearCookie(cookieName, cookieOptions());
  res.json({ message: "Logged out" });
});

export default router;
