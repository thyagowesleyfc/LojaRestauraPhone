import "server-only";

import { createHmac, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { verifyPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import { loginSchema, type LoginInput } from "@/schemas/auth";

export const ADMIN_SESSION_COOKIE = "rp_admin_session";

const SESSION_DURATION_DAYS = 7;
const SESSION_DURATION_MS = SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000;

export type AuthenticatedAdminUser = {
  id: string;
  email: string;
};

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("SESSION_SECRET must contain at least 32 characters.");
  }

  return secret;
}

export function hashSessionToken(token: string) {
  return createHmac("sha256", getSessionSecret()).update(token).digest("hex");
}

export function createSessionToken() {
  return randomBytes(32).toString("base64url");
}

function getSessionExpiresAt() {
  return new Date(Date.now() + SESSION_DURATION_MS);
}

export async function authenticateAdmin(input: LoginInput) {
  const parsed = loginSchema.parse(input);
  const admin = await prisma.adminUser.findUnique({
    where: { email: parsed.email }
  });

  if (!admin || !admin.active) {
    return null;
  }

  const passwordMatches = await verifyPassword(
    parsed.password,
    admin.passwordHash
  );

  if (!passwordMatches) {
    return null;
  }

  return {
    id: admin.id,
    email: admin.email
  };
}

export async function createAdminSession(adminUserId: string) {
  const token = createSessionToken();
  const tokenHash = hashSessionToken(token);
  const expiresAt = getSessionExpiresAt();

  await prisma.adminSession.create({
    data: {
      tokenHash,
      adminUserId,
      expiresAt
    }
  });

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt
  });
}

export async function getCurrentAdminUser(): Promise<AuthenticatedAdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!token) {
    return null;
  }

  const tokenHash = hashSessionToken(token);
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash },
    include: {
      adminUser: {
        select: {
          id: true,
          email: true,
          active: true
        }
      }
    }
  });

  if (!session || session.expiresAt <= new Date() || !session.adminUser.active) {
    return null;
  }

  return {
    id: session.adminUser.id,
    email: session.adminUser.email
  };
}

export async function requireAdminUser() {
  const user = await getCurrentAdminUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (token) {
    await prisma.adminSession.deleteMany({
      where: {
        tokenHash: hashSessionToken(token)
      }
    });
  }

  cookieStore.delete(ADMIN_SESSION_COOKIE);
}


