"use client";

import {
  CART_STORAGE_KEY,
  normalizeCartItems,
  type StoredCartItem
} from "@/lib/cart";

export const CART_UPDATED_EVENT = "rp_cart_updated";

export function readCartItems() {
  try {
    const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);
    const parsed = rawCart ? JSON.parse(rawCart) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeCartItems(parsed as StoredCartItem[]);
  } catch {
    return [];
  }
}

export function writeCartItems(items: StoredCartItem[]) {
  const normalizedItems = normalizeCartItems(items);

  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(normalizedItems));
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));

  return normalizedItems;
}
