"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { MagneticGlowCard } from "@/components/catalog/magnetic-glow-card";
import { Button } from "@/components/ui/button";
import { getAnalyticsSessionId, trackAnalyticsEvent } from "@/lib/analytics-client";
import {
  createCartItemKey,
  removeCartItem,
  updateCartItemQuantity,
  type CartItemType,
  type StoredCartItem
} from "@/lib/cart";
import { formatMoneyFromCents } from "@/lib/formatters";

import { readCartItems, writeCartItems } from "./cart-storage";

type CartPreviewItem = StoredCartItem & {
  description: string;
  unitPriceInCents: number;
  subtotalInCents: number;
  imageUrl: string | null;
  detail: string | null;
  originalPriceInCents: number | null;
  sku?: string | null;
  variantDescription?: string | null;
};

type UnavailableCartItem = StoredCartItem & {
  reason: string;
};

type CartPreview = {
  items: CartPreviewItem[];
  unavailableItems: UnavailableCartItem[];
  totalInCents: number;
  whatsappHref: string | null;
};

type CartCheckoutResponse = {
  code: string;
  whatsappHref: string;
  whatsappMessage: string;
};

async function createCheckout(items: StoredCartItem[]) {
  const response = await fetch("/api/cart/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      items,
      sessionId: getAnalyticsSessionId()
    })
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;

    throw new Error(payload?.error ?? "Não foi possível criar o pedido.");
  }

  return (await response.json()) as CartCheckoutResponse;
}

async function fetchCartPreview(items: StoredCartItem[]) {
  const response = await fetch("/api/cart/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items })
  });

  if (!response.ok) {
    throw new Error("Não foi possível validar o carrinho.");
  }

  return (await response.json()) as CartPreview;
}

export function CartPageClient() {
  const [items, setItems] = useState<StoredCartItem[]>([]);
  const [preview, setPreview] = useState<CartPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const refreshPreview = useCallback(async (nextItems: StoredCartItem[]) => {
    if (nextItems.length === 0) {
      setPreview(null);
      setLoading(false);
      setError(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const nextPreview = await fetchCartPreview(nextItems);
      setPreview(nextPreview);
      return nextPreview;
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível validar o carrinho."
      );
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    window.queueMicrotask(() => {
      if (!active) {
        return;
      }

      const storedItems = readCartItems();

      setItems(storedItems);
      void refreshPreview(storedItems);
    });

    return () => {
      active = false;
    };
  }, [refreshPreview]);

  function commitItems(nextItems: StoredCartItem[]) {
    const normalizedItems = writeCartItems(nextItems);

    setItems(normalizedItems);
    void refreshPreview(normalizedItems);
  }

  function handleQuantityChange(
    target: { type: CartItemType; id: string },
    quantity: number
  ) {
    commitItems(updateCartItemQuantity(items, target, quantity));
  }

  function trackCartItemEvent(
    type: "ADD_TO_CART" | "REMOVE_FROM_CART",
    target: { type: CartItemType; id: string }
  ) {
    trackAnalyticsEvent({
      type,
      productId: target.type === "product" ? target.id : undefined,
      productVariantId: target.type === "variant" ? target.id : undefined,
      promotionId: target.type === "combo" ? target.id : undefined
    });
  }

  function handleRemove(target: { type: CartItemType; id: string }) {
    const confirmed = window.confirm("Remover este item do carrinho?");

    if (confirmed) {
      trackCartItemEvent("REMOVE_FROM_CART", target);
      commitItems(removeCartItem(items, target));
    }
  }

  function handleClearCart() {
    const confirmed = window.confirm("Limpar todo o carrinho?");

    if (confirmed) {
      for (const item of items) {
        trackCartItemEvent("REMOVE_FROM_CART", item);
      }

      commitItems([]);
    }
  }

  async function handleCheckout() {
    const latestPreview = await refreshPreview(items);

    if (!latestPreview || latestPreview.items.length === 0) {
      window.alert("Carrinho vazio ou indisponível para envio.");
      return;
    }

    if (latestPreview.unavailableItems.length > 0) {
      window.alert(
        "Alguns itens estão indisponíveis. Remova-os antes de enviar o pedido."
      );
      return;
    }

    if (!latestPreview.whatsappHref) {
      window.alert("WhatsApp da loja não configurado.");
      return;
    }

    const confirmed = window.confirm("Enviar este pedido pelo WhatsApp?");

    if (!confirmed) {
      return;
    }

    setCheckoutLoading(true);

    try {
      const checkout = await createCheckout(items);

      trackAnalyticsEvent({ type: "WHATSAPP_CLICK" });
      trackAnalyticsEvent({ type: "ORDER_SENT_TO_WHATSAPP" });
      window.open(checkout.whatsappHref, "_blank", "noopener,noreferrer");
      commitItems([]);
    } catch (caughtError) {
      window.alert(
        caughtError instanceof Error
          ? caughtError.message
          : "Não foi possível criar o pedido."
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  const previewItemsByKey = new Map(
    preview?.items.map((item) => [createCartItemKey(item), item]) ?? []
  );
  const unavailableItemsByKey = new Map(
    preview?.unavailableItems.map((item) => [createCartItemKey(item), item]) ??
      []
  );

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <p className="text-sm font-medium uppercase tracking-wide text-primary">
          Pedido
        </p>
        <h1 className="text-4xl font-semibold">Carrinho</h1>
        <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
          Confira quantidades e valores atualizados antes de chamar a loja pelo
          WhatsApp.
        </p>
      </header>

      {error ? (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </p>
      ) : null}

      {items.length === 0 ? (
        <section className="space-y-4 rounded-lg border border-border p-6">
          <h2 className="text-xl font-semibold">Seu carrinho está vazio</h2>
          <p className="text-sm text-muted-foreground">
            Escolha produtos ou combos ativos para montar seu pedido.
          </p>
          <Button asChild>
            <Link href="/categorias">Ver categorias</Link>
          </Button>
        </section>
      ) : (
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <section className="space-y-4">
            {items.map((item) => {
              const key = createCartItemKey(item);
              const previewItem = previewItemsByKey.get(key);
              const unavailableItem = unavailableItemsByKey.get(key);

              return (
                <article
                  className="grid grid-cols-[112px_1fr] gap-3 overflow-hidden rounded-lg border border-border bg-card p-0 sm:grid-cols-[136px_1fr] sm:gap-4"
                  key={key}
                >
                  <div className="relative min-h-20 overflow-hidden bg-muted sm:min-h-24">
                    {previewItem?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        alt={previewItem.description}
                        className="h-full w-full object-cover"
                        src={previewItem.imageUrl}
                      />
                    ) : null}
                  </div>
                  <MagneticGlowCard className="cart-item-glow magnetic-glow-card--body min-w-0">
                    <div className="flex h-full min-w-0 flex-col justify-between gap-4 p-3 sm:gap-5 sm:p-4">
                    <div className="min-w-0 space-y-1.5">
                      <h2 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                        {previewItem?.description ?? "Item indisponível"}
                      </h2>
                      {previewItem?.detail ? (
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm">
                          {previewItem.sku
                            ? `SKU ${previewItem.sku} - ${previewItem.detail}`
                            : previewItem.detail}
                        </p>
                      ) : null}
                      {unavailableItem ? (
                        <p className="text-sm text-destructive">
                          {unavailableItem.reason}
                        </p>
                      ) : null}
                    </div>
                    <div className="grid grid-cols-[1fr_auto] items-center gap-x-3 gap-y-4 sm:grid-cols-[auto_1fr_auto] sm:gap-3">
                      {previewItem ? (
                        <div className="col-span-2 space-y-1 sm:order-2 sm:col-span-1">
                          {previewItem.originalPriceInCents ? (
                            <p className="text-xs text-muted-foreground line-through">
                              {formatMoneyFromCents(
                                previewItem.originalPriceInCents
                              )}
                            </p>
                          ) : null}
                          <p className="text-base font-bold leading-none text-primary sm:text-sm sm:font-semibold">
                            {formatMoneyFromCents(previewItem.subtotalInCents)}
                          </p>
                        </div>
                      ) : null}
                      <div className="flex items-center gap-2 sm:order-1">
                        <Button
                          aria-label="Diminuir quantidade"
                          disabled={item.quantity <= 1}
                          onClick={() =>
                            handleQuantityChange(item, item.quantity - 1)
                          }
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          -
                        </Button>
                        <span className="min-w-10 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <Button
                          aria-label="Aumentar quantidade"
                          onClick={() =>
                            handleQuantityChange(item, item.quantity + 1)
                          }
                          size="icon"
                          type="button"
                          variant="outline"
                        >
                          +
                        </Button>
                      </div>
                      <Button
                        aria-label="Remover item do carrinho"
                        className="size-9 justify-self-end px-0 sm:order-3 sm:h-9 sm:w-auto sm:px-4"
                        onClick={() => handleRemove(item)}
                        type="button"
                        variant="destructive"
                      >
                        <svg
                          aria-hidden="true"
                          className="size-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M3 6h18" />
                          <path d="M8 6V4h8v2" />
                          <path d="M19 6l-1 14H6L5 6" />
                          <path d="M10 11v5" />
                          <path d="M14 11v5" />
                        </svg>
                        <span className="hidden sm:inline">Remover</span>
                      </Button>
                    </div>
                    </div>
                  </MagneticGlowCard>
                </article>
              );
            })}
          </section>

          <aside className="h-fit space-y-4 rounded-lg border border-border bg-card p-5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-muted-foreground">Total</span>
              <strong className="text-xl text-primary">
                {formatMoneyFromCents(preview?.totalInCents ?? 0)}
              </strong>
            </div>
            {preview?.unavailableItems.length ? (
              <p className="text-sm text-destructive">
                Remova itens indisponíveis antes de enviar.
              </p>
            ) : null}
            <div className="grid gap-2">
              <Button
                disabled={loading || checkoutLoading || items.length === 0}
                onClick={handleCheckout}
                type="button"
              >
                {checkoutLoading ? "Gerando pedido..." : "Enviar pelo WhatsApp"}
              </Button>
              <Button
                disabled={loading || checkoutLoading || items.length === 0}
                onClick={handleClearCart}
                type="button"
                variant="outline"
              >
                Limpar carrinho
              </Button>
            </div>
            {loading ? (
              <p className="text-xs text-muted-foreground">
                Validando preços atuais...
              </p>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
