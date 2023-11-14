import express, { Application, Request, Response } from "express";
import dotenv from "dotenv";
import { logger } from "./utils/logger";

dotenv.config();

const app: Application = express();
const port: string | number = process.env.PORT || 4000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});
