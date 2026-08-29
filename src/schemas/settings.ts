import { z } from "zod";

import { sanitizeRichTextHtml } from "@/lib/privacy-content";

const requiredText = z.string().trim().min(1, "Campo obrigatorio.");
const optionalText = z
  .string()
  .trim()
  .optional()
  .transform((value) => value ?? "");
const optionalTextMax = (max: number, message: string) =>
  z
    .string()
    .trim()
    .max(max, message)
    .optional()
    .transform((value) => value ?? "");
const hexColor = z
  .string()
  .trim()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Use uma cor hexadecimal valida.");
const countdownSegment = z.coerce
  .number()
  .int("Use um numero inteiro.")
  .min(0, "Use um valor maior ou igual a zero.");

function isValidOfferLink(value: string) {
  if (!value) {
    return true;
  }

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

export const bannerInputSchema = z.object({
  redirectUrl: requiredText.max(500, "Use no maximo 500 caracteres."),
  altText: optionalText,
  displayOrder: z.coerce.number().int().min(0),
  active: z.coerce.boolean()
});

export const storeSettingsInputSchema = z
  .object({
    tradeName: requiredText.max(120, "Use no maximo 120 caracteres."),
    cnpj: optionalText,
    phone: optionalText,
    email: z.string().trim().email("E-mail invalido."),
    address: optionalText,
    mapEmbedUrl: optionalText,
    aboutText: optionalText,
    privacyPageContent: z
      .string()
      .trim()
      .max(20000, "Use no maximo 20000 caracteres na pagina de privacidade.")
      .transform(sanitizeRichTextHtml),
    whatsappNumber: z
      .string()
      .trim()
      .regex(/^$|^[0-9]+$/, "Use apenas digitos no WhatsApp."),
    whatsappInitialMessage: requiredText.max(
      300,
      "Use no maximo 300 caracteres."
    ),
    bannerTransitionSeconds: z.coerce
      .number()
      .int("Use um numero inteiro de segundos.")
      .min(3, "Use no minimo 3 segundos.")
      .max(30, "Use no maximo 30 segundos."),
    offerCountdownHeadline: optionalTextMax(
      140,
      "Use no maximo 140 caracteres na headline da oferta."
    ),
    offerCountdownLink: z
      .string()
      .trim()
      .max(500, "Use no maximo 500 caracteres no link da oferta.")
      .refine(isValidOfferLink, "Use um caminho iniciado por / ou uma URL http(s)."),
    offerCountdownHours: countdownSegment.max(168, "Use no maximo 168 horas."),
    offerCountdownMinutes: countdownSegment.max(59, "Use entre 0 e 59 minutos."),
    offerCountdownSeconds: countdownSegment.max(59, "Use entre 0 e 59 segundos."),
    offerCountdownBackgroundColor: hexColor,
    lightPrimaryColor: hexColor,
    lightBackgroundColor: hexColor,
    lightTextColor: hexColor,
    darkPrimaryColor: hexColor,
    darkBackgroundColor: hexColor,
    darkTextColor: hexColor
  })
  .superRefine((data, context) => {
    const durationSeconds =
      data.offerCountdownHours * 60 * 60 +
      data.offerCountdownMinutes * 60 +
      data.offerCountdownSeconds;
    const hasAnyOfferConfig =
      Boolean(data.offerCountdownHeadline) ||
      Boolean(data.offerCountdownLink) ||
      durationSeconds > 0;

    if (!hasAnyOfferConfig) {
      return;
    }

    if (!data.offerCountdownHeadline) {
      context.addIssue({
        code: "custom",
        message: "Informe a headline da oferta.",
        path: ["offerCountdownHeadline"]
      });
    }

    if (!data.offerCountdownLink) {
      context.addIssue({
        code: "custom",
        message: "Informe o link da oferta.",
        path: ["offerCountdownLink"]
      });
    }

    if (durationSeconds <= 0) {
      context.addIssue({
        code: "custom",
        message: "Informe um tempo maior que zero para o contador.",
        path: ["offerCountdownHours"]
      });
    }
  })
  .transform(({ offerCountdownHours, offerCountdownMinutes, offerCountdownSeconds, ...data }) => ({
    ...data,
    offerCountdownDurationSeconds:
      offerCountdownHours * 60 * 60 +
      offerCountdownMinutes * 60 +
      offerCountdownSeconds
  }));

export type BannerInput = z.infer<typeof bannerInputSchema>;
export type StoreSettingsInput = z.infer<typeof storeSettingsInputSchema>;
