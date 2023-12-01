import { z } from "zod";

export const updateProfileValidation = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});

export const updatePasswordValidation = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string().min(6),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Password and confirm password must be same",
    path: ["confirmPassword"],
  });
