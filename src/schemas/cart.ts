import { z } from "zod";

import { MAX_CART_QUANTITY } from "@/lib/cart";

export const cartItemSchema = z.object({
  type: z.enum(["product", "variant", "combo"]),
  id: z.string().min(1),
  quantity: z.coerce.number().int().min(1).max(MAX_CART_QUANTITY)
});

export const cartPreviewSchema = z.object({
  items: z.array(cartItemSchema).max(100)
});