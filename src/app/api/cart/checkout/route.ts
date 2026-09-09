import { OrderItemType, Prisma } from "@prisma/client";
import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";

import { buildWhatsAppCheckoutMessage, type CartItemType } from "@/lib/cart";
import { getCartPreview, type CartPreviewItem } from "@/lib/cart-preview";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { cartCheckoutSchema } from "@/schemas/cart";

const ORDER_CODE_ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
const ORDER_CODE_LENGTH = 10;
const MAX_CODE_ATTEMPTS = 8;

function generateOrderCode() {
  let code = "";

  for (let index = 0; index < ORDER_CODE_LENGTH; index += 1) {
    code += ORDER_CODE_ALPHABET[randomInt(ORDER_CODE_ALPHABET.length)];
  }

  return code;
}

function toOrderItemType(type: CartItemType) {
  const orderTypes: Record<CartItemType, OrderItemType> = {
    combo: OrderItemType.COMBO,
    product: OrderItemType.PRODUCT,
    variant: OrderItemType.VARIANT
  };

  return orderTypes[type];
}

function isUniqueCodeConflict(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  );
}

async function createOrderWithUniqueCode({
  items,
  sessionId,
  totalInCents
}: {
  items: CartPreviewItem[];
  sessionId?: string;
  totalInCents: number;
}) {
  for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt += 1) {
    const code = generateOrderCode();
    const whatsappMessage = buildWhatsAppCheckoutMessage(code);

    try {
      return await prisma.customerOrder.create({
        data: {
          code,
          sessionId,
          totalInCents,
          whatsappMessage,
          items: {
            create: items.map((item) => ({
              description: item.description,
              detail: item.detail,
              imageUrl: item.imageUrl,
              quantity: item.quantity,
              sku: item.sku,
              sourceProductId: item.sourceProductId,
              sourceProductVariantId: item.sourceProductVariantId,
              sourcePromotionId: item.sourcePromotionId,
              subtotalInCents: item.subtotalInCents,
              type: toOrderItemType(item.type),
              unitPriceInCents: item.unitPriceInCents
            }))
          }
        }
      });
    } catch (error) {
      if (isUniqueCodeConflict(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error("Nao foi possivel gerar um codigo unico para o pedido.");
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cartCheckoutSchema.safeParse(body);

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

  if (preview.items.length === 0) {
    return NextResponse.json(
      { error: "Carrinho vazio ou indisponivel para envio." },
      { status: 400 }
    );
  }

  if (preview.unavailableItems.length > 0) {
    return NextResponse.json(
      { error: "Remova itens indisponiveis antes de enviar o pedido." },
      { status: 409 }
    );
  }

  if (!settings.whatsappNumber) {
    return NextResponse.json(
      { error: "WhatsApp da loja nao configurado." },
      { status: 409 }
    );
  }

  const order = await createOrderWithUniqueCode({
    items: preview.items,
    sessionId: parsed.data.sessionId,
    totalInCents: preview.totalInCents
  });
  const whatsappHref = `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
    order.whatsappMessage
  )}`;

  return NextResponse.json({
    code: order.code,
    whatsappHref,
    whatsappMessage: order.whatsappMessage
  });
}