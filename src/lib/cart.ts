export const CART_STORAGE_KEY = "rp_cart";
export const MAX_CART_QUANTITY = 99;

export type CartItemType = "product" | "combo";

export type StoredCartItem = {
  type: CartItemType;
  id: string;
  quantity: number;
};

export type PricedCartItem = StoredCartItem & {
  description: string;
  unitPriceInCents: number;
  subtotalInCents: number;
};

export function createCartItemKey(item: Pick<StoredCartItem, "type" | "id">) {
  return `${item.type}:${item.id}`;
}

export function normalizeQuantity(quantity: number) {
  if (!Number.isFinite(quantity)) {
    return 1;
  }

  return Math.min(MAX_CART_QUANTITY, Math.max(1, Math.floor(quantity)));
}

export function normalizeCartItems(items: StoredCartItem[]) {
  const merged = new Map<string, StoredCartItem>();

  for (const item of items) {
    if (!item.id || (item.type !== "product" && item.type !== "combo")) {
      continue;
    }

    const key = createCartItemKey(item);
    const existing = merged.get(key);
    const nextQuantity = normalizeQuantity(
      (existing?.quantity ?? 0) + item.quantity
    );

    merged.set(key, {
      type: item.type,
      id: item.id,
      quantity: nextQuantity
    });
  }

  return Array.from(merged.values());
}

export function addCartItem(items: StoredCartItem[], item: StoredCartItem) {
  return normalizeCartItems([...items, item]);
}

export function updateCartItemQuantity(
  items: StoredCartItem[],
  target: Pick<StoredCartItem, "type" | "id">,
  quantity: number
) {
  return normalizeCartItems(
    items
      .filter((item) => createCartItemKey(item) !== createCartItemKey(target))
      .concat(
        quantity > 0
          ? [
              {
                ...target,
                quantity
              }
            ]
          : []
      )
  );
}

export function removeCartItem(
  items: StoredCartItem[],
  target: Pick<StoredCartItem, "type" | "id">
) {
  return items.filter(
    (item) => createCartItemKey(item) !== createCartItemKey(target)
  );
}

export function calculateCartTotal(items: PricedCartItem[]) {
  return items.reduce((total, item) => total + item.subtotalInCents, 0);
}

export function buildWhatsAppOrderMessage({
  initialMessage,
  items,
  totalInCents
}: {
  initialMessage: string;
  items: PricedCartItem[];
  totalInCents: number;
}) {
  const lines = [
    initialMessage.trim() || "Ola! Quero fazer um pedido.",
    "",
    "Pedido pelo site:",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.quantity}x ${item.description} - ${formatCentsForMessage(
          item.subtotalInCents
        )}`
    ),
    "",
    `Total: ${formatCentsForMessage(totalInCents)}`
  ];

  return lines.join("\n");
}

function formatCentsForMessage(valueInCents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(valueInCents / 100);
}
