import { PromotionType } from "@prisma/client";
import { NextResponse } from "next/server";

import {
  buildWhatsAppOrderMessage,
  calculateCartTotal,
  normalizeCartItems,
  type PricedCartItem
} from "@/lib/cart";
import {
  getPromotionalPriceInCents,
  isPromotionCurrentlyActive
} from "@/lib/promotions";
import { prisma } from "@/lib/prisma";
import { getStoreSettings } from "@/lib/store-settings";
import { cartPreviewSchema } from "@/schemas/cart";

type UnavailableCartItem = {
  type: "product" | "combo";
  id: string;
  quantity: number;
  reason: string;
};

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = cartPreviewSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Carrinho invalido." },
      { status: 400 }
    );
  }

  const requestedItems = normalizeCartItems(parsed.data.items);
  const productIds = requestedItems
    .filter((item) => item.type === "product")
    .map((item) => item.id);
  const comboIds = requestedItems
    .filter((item) => item.type === "combo")
    .map((item) => item.id);

  const [products, combos, settings] = await Promise.all([
    prisma.product.findMany({
      where: {
        id: { in: productIds },
        active: true,
        category: { active: true }
      },
      include: {
        category: {
          include: {
            promotions: {
              where: {
                type: PromotionType.CATEGORY_PERCENTAGE,
                active: true
              }
            }
          }
        },
        images: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          take: 1
        }
      }
    }),
    prisma.promotion.findMany({
      where: {
        id: { in: comboIds },
        type: PromotionType.PRODUCT_COMBO,
        active: true,
        comboPriceInCents: { not: null }
      },
      include: {
        images: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          take: 1
        },
        products: {
          include: {
            product: {
              include: {
                category: true
              }
            }
          },
          orderBy: [{ displayOrder: "asc" }]
        }
      }
    }),
    getStoreSettings()
  ]);

  const productsById = new Map(products.map((product) => [product.id, product]));
  const combosById = new Map(
    combos
      .filter(
        (combo) =>
          isPromotionCurrentlyActive(combo) &&
          combo.comboPriceInCents !== null &&
          combo.products.length >= 2 &&
          combo.products.every(
            (comboProduct) =>
              comboProduct.product.active && comboProduct.product.category.active
          )
      )
      .map((combo) => [combo.id, combo])
  );

  const items: Array<
    PricedCartItem & {
      imageUrl: string | null;
      detail: string | null;
      originalPriceInCents: number | null;
    }
  > = [];
  const unavailableItems: UnavailableCartItem[] = [];

  for (const requestedItem of requestedItems) {
    if (requestedItem.type === "product") {
      const product = productsById.get(requestedItem.id);

      if (!product) {
        unavailableItems.push({
          ...requestedItem,
          reason: "Produto indisponivel."
        });
        continue;
      }

      const pricing = getPromotionalPriceInCents(
        product.priceInCents,
        product.category.promotions
      );
      const subtotalInCents =
        pricing.currentPriceInCents * requestedItem.quantity;

      items.push({
        ...requestedItem,
        description: product.description,
        unitPriceInCents: pricing.currentPriceInCents,
        subtotalInCents,
        imageUrl: product.images[0]?.url ?? null,
        detail: product.category.name,
        originalPriceInCents:
          pricing.originalPriceInCents !== pricing.currentPriceInCents
            ? pricing.originalPriceInCents
            : null
      });
      continue;
    }

    const combo = combosById.get(requestedItem.id);

    if (!combo || combo.comboPriceInCents === null) {
      unavailableItems.push({
        ...requestedItem,
        reason: "Combo indisponivel."
      });
      continue;
    }

    const subtotalInCents = combo.comboPriceInCents * requestedItem.quantity;

    items.push({
      ...requestedItem,
      description: combo.description,
      unitPriceInCents: combo.comboPriceInCents,
      subtotalInCents,
      imageUrl: combo.images[0]?.url ?? null,
      detail: combo.products
        .map((comboProduct) => comboProduct.product.description)
        .join(", "),
      originalPriceInCents: null
    });
  }

  const totalInCents = calculateCartTotal(items);
  const whatsappMessage = buildWhatsAppOrderMessage({
    initialMessage: settings.whatsappInitialMessage,
    items,
    totalInCents
  });
  const whatsappHref = settings.whatsappNumber
    ? `https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(
        whatsappMessage
      )}`
    : null;

  return NextResponse.json({
    items,
    unavailableItems,
    totalInCents,
    whatsappMessage,
    whatsappHref
  });
}
