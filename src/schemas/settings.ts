import { z } from "zod";

const requiredText = z.string().trim().min(1, "Campo obrigatorio.");
const optionalText = z.string().trim().optional().transform((value) => value ?? "");
const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use uma cor hexadecimal valida.");

export const bannerInputSchema = z.object({
  redirectUrl: requiredText.max(500, "Use no maximo 500 caracteres."),
  altText: optionalText,
  displayOrder: z.coerce.number().int().min(0),
  active: z.coerce.boolean()
});

export const storeSettingsInputSchema = z.object({
  tradeName: requiredText.max(120, "Use no maximo 120 caracteres."),
  cnpj: optionalText,
  phone: optionalText,
  email: z.string().trim().email("E-mail invalido."),
  address: optionalText,
  mapEmbedUrl: optionalText,
  aboutText: optionalText,
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^$|^[0-9]+$/, "Use apenas digitos no WhatsApp."),
  whatsappInitialMessage: requiredText.max(
    300,
    "Use no maximo 300 caracteres."
  ),
  lightPrimaryColor: hexColor,
  lightBackgroundColor: hexColor,
  lightTextColor: hexColor,
  darkPrimaryColor: hexColor,
  darkBackgroundColor: hexColor,
  darkTextColor: hexColor
});

export type BannerInput = z.infer<typeof bannerInputSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsInputSchema>;
