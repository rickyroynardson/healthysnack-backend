import { z } from "zod";

export const createSaleValidation = z.object({
  products: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number(),
      })
    )
    .min(1),
});
