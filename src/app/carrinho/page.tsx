import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart/cart-page-client";

export const metadata: Metadata = {
  title: "Carrinho | RestauraPhone",
  description: "Revise produtos, combos e envie seu pedido pelo WhatsApp."
};

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <CartPageClient />
    </main>
  );
}
