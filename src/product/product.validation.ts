import { z } from "zod";

export const createProductValidation = z.object({
  name: z.string().min(3),
  price: z.number(),
  productCategoryId: z.number(),
  materials: z
    .array(
      z.object({
        name: z.string(),
        quantity: z.number().min(1),
        unit: z.string(),
        price: z.number(),
      })
    )
    .min(1, { message: "At least one material is required" }),
});

export const updateProductValidation = z.object({
  name: z.string().min(3),
  price: z.number(),
  stock: z.number().min(0),
  productCategoryId: z.number(),
  materials: z
    .array(
      z.object({
        materialId: z.number().optional(),
        name: z.string(),
        quantity: z.number().min(1),
        unit: z.string(),
        price: z.number(),
      })
    )
    .min(1, { message: "At least one material is required" }),
});

export const manageProductStockValidation = z.object({
  id: z.number(),
  quantity: z.number().min(1),
  action: z.enum(["increase", "decrease"]),
});
