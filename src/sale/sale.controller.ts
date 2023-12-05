import { Request, Response, Router } from "express";
import { createSale, getSales, getSalesProfit } from "./sale.service";
import { createSaleValidation } from "./sale.validation";
import { fromZodError } from "zod-validation-error";

const saleController: Router = Router();

saleController.get("/", async (req: Request, res: Response) => {
  try {
    const sales = await getSales();
    res.status(200).json({ message: "Showing sales", data: sales });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

saleController.get("/profit", async (req: Request, res: Response) => {
  try {
    const salesProfit = await getSalesProfit(req.query);
    res
      .status(200)
      .json({ message: "Showing sales profit", data: salesProfit });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

saleController.post("/", async (req: Request, res: Response) => {
  const result = await createSaleValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const sale = await createSale(result.data);
    res.status(201).json({ message: "Sale created successfully", data: sale });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

export default saleController;
