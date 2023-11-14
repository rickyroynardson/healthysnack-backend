import { Request, Response, Router } from "express";
import { fromZodError } from "zod-validation-error";
import { loginValidation } from "./auth.validation";
import { login } from "./auth.service";

const authController: Router = Router();

authController.post("/login", async (req: Request, res: Response) => {
  const result = await loginValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const data = await login(result.data);
    res.status(200).json({ message: "Login success", data });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

export default authController;
