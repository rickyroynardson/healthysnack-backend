import { Request, Response, Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "./product.service";
import {
  createProductValidation,
  updateProductValidation,
} from "./product.validation";
import { fromZodError } from "zod-validation-error";

const productController: Router = Router();

productController.get("/", async (req: Request, res: Response) => {
  try {
    const products = await getProducts();
    res.status(200).json({ message: "Showing products", data: products });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

productController.post("/", async (req: Request, res: Response) => {
  const result = await createProductValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const product = await createProduct(result.data);
    res
      .status(201)
      .json({ message: "Product created successfully", data: product });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

productController.patch("/:id", async (req: Request, res: Response) => {
  const result = await updateProductValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const product = await updateProduct(parseInt(req.params.id), result.data);
    res
      .status(200)
      .json({ message: "Product updated successfully", data: product });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

productController.delete("/:id", async (req: Request, res: Response) => {
  try {
    await deleteProduct(parseInt(req.params.id));
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

export default productController;
