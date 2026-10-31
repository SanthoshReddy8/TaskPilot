import { Prisma, type User } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

const passwordSaltRounds = 12;
export const authTokenLifetimeSeconds = 7 * 24 * 60 * 60;

export type PublicUser = Pick<User, "id" | "name" | "email" | "createdAt" | "updatedAt">;

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || Buffer.byteLength(secret) < 32) {
    throw new Error("JWT_SECRET must be configured with at least 32 bytes");
  }
  return secret;
}

function toPublicUser(user: User): PublicUser {
  const { passwordHash: _passwordHash, ...publicUser } = user;
  return publicUser;
}

function createToken(userId: string): string {
  return jwt.sign({}, getJwtSecret(), {
    algorithm: "HS256",
    subject: userId,
    expiresIn: authTokenLifetimeSeconds,
  });
}

export async function registerUser(name: string, email: string, password: string) {
  const passwordHash = await bcrypt.hash(password, passwordSaltRounds);

  try {
    const user = await prisma.user.create({
      data: { name, email, passwordHash },
    });

    return { user: toPublicUser(user), token: createToken(user.id) };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      throw new AuthError("An account with this email already exists", 409);
    }
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    throw new AuthError("Invalid email or password", 401);
  }

  return { user: toPublicUser(user), token: createToken(user.id) };
}

export async function findPublicUser(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    throw new AuthError("User not found", 401);
  }
  return toPublicUser(user);
}
