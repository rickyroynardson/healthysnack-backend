import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { logger } from "./utils/logger";
import authController from "./auth/auth.controller";
import profileController from "./profile/profile.controller";
import { verifiedAccessToken } from "./auth/auth.middleware";
import productCategoryController from "./product-category/product-category.controller";
import productController from "./product/product.controller";
import saleController from "./sale/sale.controller";
import userController from "./user/user.controller";

dotenv.config();

const app: Application = express();
const port: string | number = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authController);
app.use("/api/profile", verifiedAccessToken, profileController);
app.use(
  "/api/product-categories",
  verifiedAccessToken,
  productCategoryController
);
app.use("/api/products", verifiedAccessToken, productController);
app.use("/api/sales", verifiedAccessToken, saleController);
app.use("/api/users", verifiedAccessToken, userController);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
