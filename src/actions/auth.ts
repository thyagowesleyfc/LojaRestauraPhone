"use server";

import { redirect } from "next/navigation";

import {
  authenticateAdmin,
  clearAdminSession,
  createAdminSession
} from "@/lib/auth";
import { loginSchema } from "@/schemas/auth";

export type LoginActionState = {
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
      error: parsed.error.issues[0]?.message ?? "Dados invalidos."
    };
  }

  const admin = await authenticateAdmin(parsed.data);

  if (!admin) {
    return {
      error: "E-mail ou senha invalidos."
    };
  }

  await createAdminSession(admin.id);
  redirect("/admin");
}

export async function logoutAction() {
  await clearAdminSession();
  redirect("/admin/login");
}
