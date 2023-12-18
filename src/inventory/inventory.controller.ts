import { Request, Response, Router } from "express";
import {
  createInventory,
  deleteInventory,
  getAllInventories,
  getInventories,
  getInventoryLogs,
  manageInventoryStock,
  updateInventory,
} from "./inventory.service";
import {
  createInventoryValidation,
  manageInventoryStockValidation,
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

inventoryController.get("/all", async (req: Request, res: Response) => {
  try {
    const inventories = await getAllInventories();
    res.status(200).json({ message: "Showing inventory", data: inventories });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

inventoryController.get("/log", async (req: Request, res: Response) => {
  try {
    const inventoryLogs = await getInventoryLogs();
    res
      .status(200)
      .json({ message: "Showing inventory log", data: inventoryLogs });
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

inventoryController.post("/manage", async (req: Request, res: Response) => {
  const result = await manageInventoryStockValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    await manageInventoryStock(result.data);
    res
      .status(200)
      .json({ message: `Inventory stock ${result.data.action} successfully` });
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
