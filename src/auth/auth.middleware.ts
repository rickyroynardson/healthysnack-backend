import { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../utils/jwt";
import { JwtPayload } from "jsonwebtoken";

export interface RequestWithUser extends Request {
  user?: {
    id: number;
  };
}

export const verifiedAccessToken = async (
  req: RequestWithUser,
  res: Response,
  next: NextFunction
) => {
  const authorizationHeader = req.headers.authorization;
  if (!authorizationHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authorizationHeader.split(" ")[1];

  try {
    const decodedToken = verifyAccessToken(token);

    req.user = {
      id: (decodedToken as JwtPayload).id,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};
