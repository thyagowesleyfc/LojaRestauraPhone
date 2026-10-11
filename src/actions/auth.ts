"use server";

import { redirect } from "next/navigation";

import {
  authenticateAdmin,
  clearAdminSession,
  createAdminSession
} from "@/lib/auth";
import {
  requestAdminPasswordReset,
  resetAdminPassword
} from "@/lib/password-reset";
import {
  forgotPasswordSchema,
  loginSchema,
  resetPasswordSchema
} from "@/schemas/auth";

export type LoginActionState = {
  error?: string;
};

export type ForgotPasswordActionState = {
  error?: string;
  success?: string;
};

export type ResetPasswordActionState = {
  error?: string;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Dados inválidos."
    };
  }

  const admin = await authenticateAdmin(parsed.data);

  if (!admin) {
    return {
      error: "E-mail ou senha inválidos."
    };
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function requestPasswordResetAction(
  _previousState: ForgotPasswordActionState,
  formData: FormData
): Promise<ForgotPasswordActionState> {
  const parsed = forgotPasswordSchema.safeParse({
    email: formData.get("email")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Informe o e-mail cadastrado."
    };
  }

  try {
    const result = await requestAdminPasswordReset(parsed.data);

    if (!result.ok) {
      return { error: result.message ?? "Link de redefinição inválido ou expirado." };
    }

    return { success: result.message };
  } catch (error) {
    console.error(error);
    return {
      error: "Não foi possível enviar o e-mail de redefinição agora."
    };
  }
}

export async function resetPasswordAction(
  _previousState: ResetPasswordActionState,
  formData: FormData
): Promise<ResetPasswordActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: formData.get("token"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword")
  });

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Dados inválidos."
    };
  }

  const result = await resetAdminPassword(parsed.data);

  if (!result.ok) {
    return { error: result.message ?? "Link de redefinição inválido ou expirado." };
  }

  redirect("/admin/login?senha=redefinida");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}