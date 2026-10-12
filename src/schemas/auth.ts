import { z } from "zod";

const emailSchema = z
  .string()
  .trim()
  .email("Informe um e-mail válido.")
  .toLowerCase();

const newPasswordSchema = z
  .string()
  .min(8, "A nova senha deve ter pelo menos 8 caracteres.")
  .max(128, "A nova senha deve ter no máximo 128 caracteres.");

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Informe a senha.")
});

export const forgotPasswordSchema = z.object({
  email: emailSchema
});

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(20, "Link de redefinição inválido."),
    password: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha.")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "A confirmação deve ser igual à nova senha.",
    path: ["confirmPassword"]
  });

export const changeAdminPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Informe a senha atual."),
    newPassword: newPasswordSchema,
    confirmPassword: z.string().min(1, "Confirme a nova senha.")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "A confirmação deve ser igual à nova senha.",
    path: ["confirmPassword"]
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "A nova senha deve ser diferente da senha atual.",
    path: ["newPassword"]
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type ChangeAdminPasswordInput = z.infer<
  typeof changeAdminPasswordSchema
>;