import { Request, Response, Router } from "express";
import { createPurchaseValidation } from "./purchase.validation";
import { fromZodError } from "zod-validation-error";
import { createPurchase, getPurchases } from "./purchase.service";

const purchaseController: Router = Router();

purchaseController.get("/", async (req: Request, res: Response) => {
  try {
    const purchases = await getPurchases(req.query);
    res.status(200).json({ message: "Showing all purchases", ...purchases });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

purchaseController.post("/", async (req: Request, res: Response) => {
  const result = await createPurchaseValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const purchase = await createPurchase(result.data);
    res
      .status(201)
      .json({ message: "Purchase created successfully", data: purchase });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

export default purchaseController;
