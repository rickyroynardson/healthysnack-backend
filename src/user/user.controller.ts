import { Request, Response, Router } from "express";
import { createUser, deleteUser, getUsers } from "./user.service";
import { createUserValidation } from "./user.validation";
import { fromZodError } from "zod-validation-error";

const userController: Router = Router();

userController.get("/", async (req: Request, res: Response) => {
  try {
    const users = await getUsers();
    res.status(200).json({ message: "Showing users", data: users });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

userController.post("/", async (req: Request, res: Response) => {
  const result = await createUserValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const user = await createUser(result.data);
    res.status(201).json({ message: "User created successfully", data: user });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

userController.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteUser(parseInt(req.params.id));
    res
      .status(200)
      .json({
        message: "User deleted successfully",
        data: { user: req.params.id },
      });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

export default userController;
