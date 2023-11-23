import { z } from "zod";

export const updateProfileValidation = z.object({
  name: z.string().min(3),
  email: z.string().email(),
});
