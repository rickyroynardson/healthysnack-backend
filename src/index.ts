import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import { logger } from "./utils/logger";
import authController from "./auth/auth.controller";

dotenv.config();

const app: Application = express();
const port: string | number = process.env.PORT || 4000;

app.use(express.json());
app.use(cors());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.use("/api/auth", authController);

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
