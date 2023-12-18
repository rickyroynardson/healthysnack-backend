import { z } from "zod";

export const createInventoryValidation = z.object({
  name: z.string().min(3),
  unit: z.string().min(1),
});

export const updateInventoryValidation = z.object({
  name: z.string().min(3),
  stock: z.number().min(0),
  unit: z.string().min(1),
});

export const manageInventoryStockValidation = z.object({
  id: z.number(),
  quantity: z.number().min(1),
  memo: z.string(),
  action: z.enum(["increase", "decrease"]),
});
