"use client";

import { useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { trackAnalyticsEvent } from "@/lib/analytics-client";
import { addCartItem } from "@/lib/cart";

import { readCartItems, writeCartItems } from "../cart/cart-storage";

type ProductVariantSelectorProps = {
  productDescription: string;
  productId: string;
  variants: Array<{
    id: string;
    sku: string;
    values: Array<{
      characteristic: {
        name: string;
      };
      characteristicOption: {
        name: string;
      };
    }>;
  }>;
};

function getVariantLabel(variant: ProductVariantSelectorProps["variants"][number]) {
  const values = variant.values
    .map(
      (value) =>
        `${value.characteristic.name}: ${value.characteristicOption.name}`
    )
    .join(" / ");

  return values || "Variacao disponivel";
}

export function ProductVariantSelector({
  productDescription,
  productId,
  variants
}: ProductVariantSelectorProps) {
  const [selectedVariantId, setSelectedVariantId] = useState("");
  const selectedVariant = useMemo(
    () => variants.find((variant) => variant.id === selectedVariantId) ?? null,
    [selectedVariantId, variants]
  );

  function handleAddToCart() {
    if (!selectedVariant) {
      window.alert("Selecione uma variacao antes de adicionar ao carrinho.");
      return;
    }

    const confirmed = window.confirm(
      `Adicionar "${productDescription}" ao carrinho?`
    );

    if (!confirmed) {
      return;
    }

    const nextItems = addCartItem(readCartItems(), {
      type: "variant",
      id: selectedVariant.id,
      quantity: 1
    });

    writeCartItems(nextItems);
    trackAnalyticsEvent({
      type: "ADD_TO_CART",
      productId,
      productVariantId: selectedVariant.id
    });
    window.alert("Produto adicionado ao carrinho.");
  }

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border p-4">
      <div>
        <h2 className="font-semibold">Escolha a variacao</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          A selecao sera enviada junto com o pedido no WhatsApp.
        </p>
      </div>
      <label className="block space-y-2 text-sm">
        <span className="font-medium">Variacao disponivel</span>
        <select
          value={selectedVariantId}
          onChange={(event) => setSelectedVariantId(event.target.value)}
          className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          <option value="">Selecionar opcao</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {getVariantLabel(variant)}
            </option>
          ))}
        </select>
      </label>
      {selectedVariant ? (
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          {selectedVariant.values.map((value) => (
            <div key={value.characteristic.name}>
              <dt className="text-xs font-medium text-muted-foreground">
                {value.characteristic.name}
              </dt>
              <dd>{value.characteristicOption.name}</dd>
            </div>
          ))}
        </dl>
      ) : null}
      <Button
        className="self-start"
        disabled={!selectedVariant}
        onClick={handleAddToCart}
        type="button"
      >
        Adicionar ao carrinho
      </Button>
    </section>
  );
}