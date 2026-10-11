import "server-only";

import { cookies } from "next/headers";

import { createSessionToken, hashSessionToken } from "@/lib/auth";
import { getAppUrl, sendPasswordResetEmail } from "@/lib/email";
import { hashPassword } from "@/lib/password";
import { prisma } from "@/lib/prisma";
import type { ForgotPasswordInput, ResetPasswordInput } from "@/schemas/auth";

const RESET_SESSION_COOKIE = "rp_password_reset_session";
const RESET_SESSION_DURATION_DAYS = 1;
const RESET_TOKEN_DURATION_MINUTES = 30;
const REQUEST_INTERVAL_MINUTES = 15;
const BASE_PENALTY_MS = 60 * 1000;
const MAX_PENALTY_MS = 60 * 60 * 1000;

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60 * 1000);
}

function formatWait(ms: number) {
  const totalSeconds = Math.max(1, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds} segundo${seconds === 1 ? "" : "s"}`;
  }

  return `${minutes} minuto${minutes === 1 ? "" : "s"}`;
}

async function getResetSessionHash() {
  const cookieStore = await cookies();
  let token = cookieStore.get(RESET_SESSION_COOKIE)?.value;

  if (!token) {
    token = createSessionToken();
    cookieStore.set(RESET_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      expires: new Date(
        Date.now() + RESET_SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000
      )
    });
  }

  return hashSessionToken(token);
}

async function enforcePasswordResetLimit(now: Date) {
  const sessionHash = await getResetSessionHash();
  const attempt = await prisma.adminPasswordResetAttempt.findUnique({
    where: { sessionHash }
  });

  if (attempt?.blockedUntil && attempt.blockedUntil > now) {
    return {
      allowed: false,
      message: `Aguarde ${formatWait(attempt.blockedUntil.getTime() - now.getTime())} antes de solicitar outro link.`
    };
  }

  if (
    attempt?.lastRequestedAt &&
    now.getTime() - attempt.lastRequestedAt.getTime() <
      REQUEST_INTERVAL_MINUTES * 60 * 1000
  ) {
    const penaltyCount = attempt.penaltyCount + 1;
    const penaltyMs = Math.min(
      BASE_PENALTY_MS * 2 ** (penaltyCount - 1),
      MAX_PENALTY_MS
    );

    await prisma.adminPasswordResetAttempt.update({
      where: { sessionHash },
      data: {
        requestCount: { increment: 1 },
        penaltyCount,
        blockedUntil: new Date(now.getTime() + penaltyMs)
      }
    });

    return {
      allowed: false,
      message: `Muitas solicitações em sequência. Aguarde ${formatWait(penaltyMs)} para tentar novamente.`
    };
  }

  await prisma.adminPasswordResetAttempt.upsert({
    where: { sessionHash },
    create: {
      sessionHash,
      requestCount: 1,
      lastRequestedAt: now
    },
    update: {
      requestCount: { increment: 1 },
      lastRequestedAt: now,
      blockedUntil: null
    }
  });

  return { allowed: true, message: null };
}

export async function requestAdminPasswordReset(input: ForgotPasswordInput) {
  const now = new Date();
  const limit = await enforcePasswordResetLimit(now);

  if (!limit.allowed) {
    return {
      ok: false,
      message: limit.message ?? "Aguarde antes de solicitar outro link."
    };
  }

  const admin = await prisma.adminUser.findUnique({
    where: { email: input.email },
    select: { id: true, email: true, active: true }
  });

  if (admin?.active) {
    const token = createSessionToken();
    const tokenHash = hashSessionToken(token);
    const expiresAt = addMinutes(now, RESET_TOKEN_DURATION_MINUTES);

    await prisma.$transaction([
      prisma.adminPasswordResetToken.updateMany({
        where: {
          adminUserId: admin.id,
          usedAt: null,
          expiresAt: { gt: now }
        },
        data: { usedAt: now }
      }),
      prisma.adminPasswordResetToken.create({
        data: {
          tokenHash,
          adminUserId: admin.id,
          expiresAt
        }
      })
    ]);

    const resetUrl = `${getAppUrl()}/redefinir-senha?token=${encodeURIComponent(token)}`;
    await sendPasswordResetEmail({ email: admin.email, resetUrl });
  }

  return {
    ok: true,
    message: "Enviamos o link de redefinição para o e-mail cadastrado."
  };
}

export async function resetAdminPassword(input: ResetPasswordInput) {
  const now = new Date();
  const tokenHash = hashSessionToken(input.token);
  const resetToken = await prisma.adminPasswordResetToken.findUnique({
    where: { tokenHash },
    include: {
      adminUser: {
        select: { id: true, active: true }
      }
    }
  });

  if (
    !resetToken ||
    resetToken.usedAt ||
    resetToken.expiresAt <= now ||
    !resetToken.adminUser.active
  ) {
    return {
      ok: false,
      message: "Link de redefinição inválido ou expirado. Solicite um novo link."
    };
  }

  const passwordHash = await hashPassword(input.password);

  await prisma.$transaction([
    prisma.adminUser.update({
      where: { id: resetToken.adminUserId },
      data: { passwordHash }
    }),
    prisma.adminPasswordResetToken.update({
      where: { id: resetToken.id },
      data: { usedAt: now }
    }),
    prisma.adminSession.deleteMany({
      where: { adminUserId: resetToken.adminUserId }
    })
  ]);

  return { ok: true, message: null };
}