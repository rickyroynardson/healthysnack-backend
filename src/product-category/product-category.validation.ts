import { z } from "zod";

export const createProductCategoryValidation = z.object({
  name: z.string().min(3),
});

export const updateProductCategoryValidation = z.object({
  name: z.string().min(3),
});
