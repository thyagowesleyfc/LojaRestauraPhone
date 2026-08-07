"use client";

import { Button } from "@/components/ui/button";
import { addCartItem, type CartItemType } from "@/lib/cart";

import { readCartItems, writeCartItems } from "./cart-storage";

type AddToCartButtonProps = {
  item: {
    type: CartItemType;
    id: string;
    description: string;
  };
  children?: string;
};

export function AddToCartButton({
  item,
  children = "Adicionar ao carrinho"
}: AddToCartButtonProps) {
  function handleAddToCart() {
    const confirmed = window.confirm(
      `Adicionar "${item.description}" ao carrinho?`
    );

    if (!confirmed) {
      return;
    }

    const nextItems = addCartItem(readCartItems(), {
      type: item.type,
      id: item.id,
      quantity: 1
    });

    writeCartItems(nextItems);
    window.alert("Item adicionado ao carrinho.");
  }

  return (
    <Button onClick={handleAddToCart} type="button">
      {children}
    </Button>
  );
}
