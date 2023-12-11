import { Request, Response, Router } from "express";
import {
  createInventory,
  deleteInventory,
  getInventories,
  updateInventory,
} from "./inventory.service";
import {
  createInventoryValidation,
  updateInventoryValidation,
} from "./inventory.validation";
import { fromZodError } from "zod-validation-error";

const inventoryController: Router = Router();

inventoryController.get("/", async (req: Request, res: Response) => {
  try {
    const inventories = await getInventories(req.query);
    res.status(200).json({ message: "Showing inventory", ...inventories });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

inventoryController.post("/", async (req: Request, res: Response) => {
  const result = await createInventoryValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const inventory = await createInventory(result.data);
    res
      .status(201)
      .json({ message: "Inventory created successfully", data: inventory });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

inventoryController.patch("/:id", async (req: Request, res: Response) => {
  const result = await updateInventoryValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const inventory = await updateInventory(
      parseInt(req.params.id),
      result.data
    );
    res
      .status(200)
      .json({ message: "Inventory updated successfully", data: inventory });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

inventoryController.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteInventory(parseInt(req.params.id));
    res.status(200).json({ message: "Inventory deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

export default inventoryController;