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
