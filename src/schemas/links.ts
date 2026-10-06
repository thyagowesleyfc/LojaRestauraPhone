import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatório.");
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "");

function isValidRedirectUrl(value: string) {
  if (value.startsWith("/") && !value.startsWith("//")) {
    return true;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export const storeLinkInputSchema = z.object({
  title: requiredText.max(80, "Use no máximo 80 caracteres."),
  description: optionalText.pipe(
    z.string().max(500, "Use no máximo 500 caracteres.")
  ),
  redirectUrl: requiredText
    .max(500, "Use no máximo 500 caracteres.")
    .refine(isValidRedirectUrl, "Use um caminho iniciado por / ou uma URL http(s)."),
  displayOrder: z.coerce
    .number()
    .int("Use um número inteiro.")
    .min(0, "Use um valor maior ou igual a zero."),
  active: z.coerce.boolean()
});

export type StoreLinkInput = z.infer<typeof storeLinkInputSchema>;