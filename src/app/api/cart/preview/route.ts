import { NextResponse } from "next/server";

import { buildWhatsAppOrderMessage } from "@/lib/cart";
import { getCartPreview } from "@/lib/cart-preview";
import { getStoreSettings } from "@/lib/store-settings";
import { cartPreviewSchema } from "@/schemas/cart";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cartPreviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Carrinho invalido." },
      { status: 400 }
    );
  }

  const [preview, settings] = await Promise.all([
    getCartPreview(parsed.data.items),
    getStoreSettings()
  ]);
  const whatsappMessage = buildWhatsAppOrderMessage({
    items: preview.items,
    totalInCents: preview.totalInCents
  });
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : null;

  return NextResponse.json({
    ...preview,
    whatsappMessage,
    whatsappHref
  });
}