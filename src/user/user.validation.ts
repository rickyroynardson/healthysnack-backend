import { z } from "zod";

export const createUserValidation = z
  .object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Password and confirm password must be same",
    path: ["confirmPassword"],
  });
