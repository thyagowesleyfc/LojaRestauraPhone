import type { Metadata } from "next";

import { CartPageClient } from "@/components/cart/cart-page-client";
import { getStoreSettings } from "@/lib/store-settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();

  return {
    title: `Carrinho | ${settings.tradeName}`,
    description: "Revise produtos, combos e envie seu pedido pelo WhatsApp."
  };
}

export default function CartPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10">
      <CartPageClient />
    </main>
  );
}
