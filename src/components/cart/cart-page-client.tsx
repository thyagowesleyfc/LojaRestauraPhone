"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  createCartItemKey,
  removeCartItem,
  updateCartItemQuantity,
  type CartItemType,
  type StoredCartItem
} from "@/lib/cart";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
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

async function fetchCartPreview(items: StoredCartItem[]) {
  const response = await fetch("/api/cart/preview", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ items })
  });

  if (!response.ok) {
    throw new Error("Nao foi possivel validar o carrinho.");
  }

  return (await response.json()) as CartPreview;
}

export function CartPageClient() {
  const [items, setItems] = useState<StoredCartItem[]>([]);
  const [preview, setPreview] = useState<CartPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
          : "Nao foi possivel validar o carrinho."
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
      window.alert("Carrinho vazio ou indisponivel para envio.");
      return;
    }

    if (latestPreview.unavailableItems.length > 0) {
      window.alert(
        "Alguns itens estao indisponiveis. Remova-os antes de enviar o pedido."
      );
      return;
    }

    if (!latestPreview.whatsappHref) {
      window.alert("WhatsApp da loja nao configurado.");
      return;
    }

    const confirmed = window.confirm("Enviar este pedido pelo WhatsApp?");

    if (!confirmed) {
      return;
    }

    trackAnalyticsEvent({ type: "WHATSAPP_CLICK" });
    trackAnalyticsEvent({ type: "ORDER_SENT_TO_WHATSAPP" });
    window.open(latestPreview.whatsappHref, "_blank", "noopener,noreferrer");
    commitItems([]);
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
          <h2 className="text-xl font-semibold">Seu carrinho esta vazio</h2>
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
                  className="grid grid-cols-[80px_1fr] gap-3 rounded-lg border border-border bg-card p-3 sm:grid-cols-[96px_1fr] sm:gap-4 sm:p-4"
                  key={key}
                >
                  {previewItem?.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      alt={previewItem.description}
                      className="size-20 rounded-md object-cover sm:size-24"
                      src={previewItem.imageUrl}
                    />
                  ) : (
                    <div className="size-20 rounded-md bg-muted sm:size-24" />
                  )}
                  <div className="min-w-0 space-y-3 sm:space-y-4">
                    <div className="min-w-0 space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wide text-primary">
                        {item.type === "combo" ? "Combo" : item.type === "variant" ? "SKU" : "Produto"}
                      </p>
                      <h2 className="line-clamp-2 text-sm font-semibold leading-snug sm:text-base">
                        {previewItem?.description ?? "Item indisponivel"}
                      </h2>
                      {previewItem?.detail ? (
                        <p className="line-clamp-2 text-xs leading-snug text-muted-foreground sm:text-sm">
                          {previewItem.sku ? `SKU ${previewItem.sku} - ${previewItem.detail}` : previewItem.detail}
                        </p>
                      ) : null}
                      {unavailableItem ? (
                        <p className="text-sm text-destructive">
                          {unavailableItem.reason}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2">
                        <Button
                          aria-label="Diminuir quantidade"
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
                      <div className="flex items-center justify-between gap-3 sm:justify-start">
                        {previewItem ? (
                          <div className="text-left sm:text-right">
                            {previewItem.originalPriceInCents ? (
                              <p className="text-xs text-muted-foreground line-through">
                                {formatMoneyFromCents(
                                  previewItem.originalPriceInCents
                                )}
                              </p>
                            ) : null}
                            <p className="text-sm font-semibold text-primary">
                              {formatMoneyFromCents(
                                previewItem.subtotalInCents
                              )}
                            </p>
                          </div>
                        ) : null}
                        <Button
                          onClick={() => handleRemove(item)}
                          type="button"
                          variant="destructive"
                        >
                          Remover
                        </Button>
                      </div>
                    </div>
                  </div>
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
                Remova itens indisponiveis antes de enviar.
              </p>
            ) : null}
            <div className="grid gap-2">
              <Button
                disabled={loading || items.length === 0}
                onClick={handleCheckout}
                type="button"
              >
                Enviar pelo WhatsApp
              </Button>
              <Button
                disabled={loading || items.length === 0}
                onClick={handleClearCart}
                type="button"
                variant="outline"
              >
                Limpar carrinho
              </Button>
            </div>
            {loading ? (
              <p className="text-xs text-muted-foreground">
                Validando precos atuais...
              </p>
            ) : null}
          </aside>
        </div>
      )}
    </div>
  );
}
