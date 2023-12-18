import { z } from "zod";

export const createPurchaseValidation = z.object({
  invoiceNumber: z.string().min(3),
  vendor: z.string(),
  orderDate: z.string(),
  memo: z.string(),
  inventories: z
    .array(
      z.object({
        inventoryId: z.number(),
        quantity: z.number().min(1),
        price: z.number(),
      })
    )
    .min(1),
});
