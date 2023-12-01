import { z } from "zod";

export const createProductValidation = z.object({
  name: z.string().min(3),
  price: z.number(),
  productCategoryId: z.number(),
});

export const updateProductValidation = z.object({
  name: z.string().min(3),
  price: z.number(),
  stock: z.number().min(0),
  productCategoryId: z.number(),
});

export const manageProductStockValidation = z.object({
  id: z.number(),
  quantity: z.number().min(1),
  action: z.enum(["increase", "decrease"]),
});