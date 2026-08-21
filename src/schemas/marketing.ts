import { z } from "zod";

const optionalIdentifier = z.string().trim().max(80).optional().transform((value) => value ?? "");
const checkbox = z.coerce.boolean();

function validateProviderIdentifier({
  active,
  identifier,
  label,
  pattern
}: {
  active: boolean;
  identifier: string;
  label: string;
  pattern: RegExp;
}) {
  if (active && !identifier) {
    return `${label}: informe o identificador antes de ativar.`;
  }

  if (identifier && !pattern.test(identifier)) {
    return `${label}: identificador invalido.`;
  }

  return null;
}

export const marketingIntegrationsInputSchema = z
  .object({
    googleTagManagerActive: checkbox,
    googleTagManagerId: optionalIdentifier,
    metaPixelActive: checkbox,
    metaPixelId: optionalIdentifier,
    tiktokPixelActive: checkbox,
    tiktokPixelId: optionalIdentifier
  })
  .superRefine((value, context) => {
    const validations = [
      validateProviderIdentifier({
        active: value.googleTagManagerActive,
        identifier: value.googleTagManagerId,
        label: "Google Tag Manager",
        pattern: /^GTM-[A-Za-z0-9_-]{3,64}$/
      }),
      validateProviderIdentifier({
        active: value.metaPixelActive,
        identifier: value.metaPixelId,
        label: "Meta Pixel",
        pattern: /^[A-Za-z0-9_-]{3,80}$/
      }),
      validateProviderIdentifier({
        active: value.tiktokPixelActive,
        identifier: value.tiktokPixelId,
        label: "TikTok Pixel",
        pattern: /^[A-Za-z0-9_-]{3,80}$/
      })
    ];

    for (const message of validations) {
      if (message) {
        context.addIssue({
          code: "custom",
          message
        });
      }
    }
  });

export type MarketingIntegrationsInput = z.infer<
  typeof marketingIntegrationsInputSchema
>;