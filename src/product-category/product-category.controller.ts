import { Request, Response, Router } from "express";
import {
  createProductCategory,
  deleteProductCategory,
  getProductCategories,
  updateProductCategory,
} from "./product-category.service";
import {
  createProductCategoryValidation,
  updateProductCategoryValidation,
} from "./product-category.validation";
import { fromZodError } from "zod-validation-error";

const productCategoryController: Router = Router();

productCategoryController.get("/", async (req: Request, res: Response) => {
  try {
    const productCategories = await getProductCategories();
    res
      .status(200)
      .json({ message: "Showing product categories", data: productCategories });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

productCategoryController.post("/", async (req: Request, res: Response) => {
  const result = await createProductCategoryValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const productCategory = await createProductCategory(result.data);
    res.status(201).json({
      message: "Product category created successfully",
      data: productCategory,
    });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

productCategoryController.patch("/:id", async (req: Request, res: Response) => {
  const result = await updateProductCategoryValidation.safeParseAsync(req.body);
  if (!result.success) {
    return res
      .status(422)
      .json({ message: fromZodError(result.error).message });
  }

  try {
    const productCategory = await updateProductCategory(
      parseInt(req.params.id),
      result.data
    );
    res
      .status(200)
      .json({
        message: "Product category updated successfully",
        data: productCategory,
      });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    }
  }
});

productCategoryController.delete(
  "/:id",
  async (req: Request, res: Response) => {
    try {
      await deleteProductCategory(parseInt(req.params.id));
      res
        .status(200)
        .json({ message: "Product category deleted successfully" });
    } catch (error) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      }
    }
  }
);

export default productCategoryController;
