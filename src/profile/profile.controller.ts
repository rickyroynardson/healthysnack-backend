import { Response, Router } from "express";
import { RequestWithUser } from "../auth/auth.middleware";
import { getProfile, updateProfile } from "./profile.service";
import { updateProfileValidation } from "./profile.validation";
import { fromZodError } from "zod-validation-error";

const profileController: Router = Router();

profileController.get("/", async (req: RequestWithUser, res: Response) => {
  try {
    const profile = await getProfile(req.user?.id!);
    res.status(200).json({ message: "Showing user profile", data: profile });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

profileController.patch("/", async (req: RequestWithUser, res: Response) => {
  const result = await updateProfileValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const profile = await updateProfile(req.user?.id!, result.data);
    res
      .status(200)
      .json({ message: "Profile updated successfully", data: profile });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

export default profileController;
