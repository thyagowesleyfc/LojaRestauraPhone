import { PromotionType } from "@prisma/client";

import {
  calculateCartTotal,
  normalizeCartItems,
  type PricedCartItem,
  type StoredCartItem
} from "@/lib/cart";
import {
  getPromotionalPriceInCents,
  isPromotionCurrentlyActive
} from "@/lib/promotions";
import { prisma } from "@/lib/prisma";

export type UnavailableCartItem = StoredCartItem & {
  reason: string;
};

export type CartPreviewItem = PricedCartItem & {
  imageUrl: string | null;
  detail: string | null;
  originalPriceInCents: number | null;
  sourceProductId?: string | null;
  sourceProductVariantId?: string | null;
  sourcePromotionId?: string | null;
};

export type CartPreview = {
  items: CartPreviewItem[];
  unavailableItems: UnavailableCartItem[];
  totalInCents: number;
};

function formatVariantDescription(
  values: Array<{
    characteristic: { name: string };
    characteristicOption: { name: string };
  }>
) {
  return values
    .map((value) => `${value.characteristic.name}: ${value.characteristicOption.name}`)
    .join(" / ");
}

export async function getCartPreview(inputItems: StoredCartItem[]) {
  const requestedItems = normalizeCartItems(inputItems);
  const productIds = requestedItems
    .filter((item) => item.type === "product")
    .map((item) => item.id);
  const variantIds = requestedItems
    .filter((item) => item.type === "variant")
    .map((item) => item.id);
  const comboIds = requestedItems
    .filter((item) => item.type === "combo")
    .map((item) => item.id);

  const [products, variants, combos] = await Promise.all([
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
    prisma.productVariant.findMany({
      where: {
        id: { in: variantIds },
        active: true,
        product: {
          active: true,
          category: { active: true }
        }
      },
      include: {
        images: {
          orderBy: [{ displayOrder: "asc" }, { createdAt: "asc" }],
          take: 1
        },
        values: {
          include: {
            characteristic: true,
            characteristicOption: true
          },
          orderBy: [{ characteristic: { displayOrder: "asc" } }]
        },
        product: {
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
    })
  ]);

  const productsById = new Map(products.map((product) => [product.id, product]));
  const variantsById = new Map(variants.map((variant) => [variant.id, variant]));
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

  const items: CartPreviewItem[] = [];
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
            : null,
        sourceProductId: product.id
      });
      continue;
    }

    if (requestedItem.type === "variant") {
      const variant = variantsById.get(requestedItem.id);

      if (!variant) {
        unavailableItems.push({
          ...requestedItem,
          reason: "SKU indisponivel."
        });
        continue;
      }

      const pricing = getPromotionalPriceInCents(
        variant.product.priceInCents,
        variant.product.category.promotions
      );
      const subtotalInCents =
        pricing.currentPriceInCents * requestedItem.quantity;
      const variantDescription = formatVariantDescription(variant.values);

      items.push({
        ...requestedItem,
        description: variant.product.description,
        unitPriceInCents: pricing.currentPriceInCents,
        subtotalInCents,
        imageUrl:
          variant.images[0]?.url ?? variant.product.images[0]?.url ?? null,
        detail: variantDescription || variant.product.category.name,
        originalPriceInCents:
          pricing.originalPriceInCents !== pricing.currentPriceInCents
            ? pricing.originalPriceInCents
            : null,
        sku: variant.sku,
        variantDescription,
        sourceProductId: variant.product.id,
        sourceProductVariantId: variant.id
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
      originalPriceInCents: null,
      sourcePromotionId: combo.id
    });
  }

  return {
    items,
    unavailableItems,
    totalInCents: calculateCartTotal(items)
  } satisfies CartPreview;
}