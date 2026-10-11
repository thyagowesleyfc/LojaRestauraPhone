import "server-only";

import nodemailer from "nodemailer";

import { env } from "@/lib/env";

type PasswordResetEmailInput = {
  email: string;
  resetUrl: string;
};

function hasSmtpConfig() {
  return Boolean(env.SMTP_HOST && env.SMTP_FROM);
}

export function getAppUrl() {
  return env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function sendPasswordResetEmail({
  email,
  resetUrl
}: PasswordResetEmailInput) {
  if (!hasSmtpConfig()) {
    console.info(
      `[auth] SMTP não configurado. Link de redefinição para ${email}: ${resetUrl}`
    );
    return;
  }

  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT ?? 587,
    secure: env.SMTP_SECURE === "true",
    auth:
      env.SMTP_USER && env.SMTP_PASSWORD
        ? {
            user: env.SMTP_USER,
            pass: env.SMTP_PASSWORD
          }
        : undefined
  });

  await transporter.sendMail({
    from: env.SMTP_FROM,
    to: email,
    subject: "Redefinição de senha do painel RestauraPhone",
    text: `Recebemos uma solicitação para redefinir a senha do painel administrativo. Acesse ${resetUrl} para criar uma nova senha. O link expira em 30 minutos.`,
    html: `<p>Recebemos uma solicitação para redefinir a senha do painel administrativo.</p><p><a href="${resetUrl}">Redefinir senha</a></p><p>O link expira em 30 minutos.</p>`
  });
}