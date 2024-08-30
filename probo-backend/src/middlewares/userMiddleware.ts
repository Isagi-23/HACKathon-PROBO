import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, ADMIN_JWT_SECRET } from "../configs";
import { UserAuthenticatedRequest } from "../types";
export function authMiddleware(
  req: UserAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization ?? "";
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload & {
      userId: number;
    };
   
    if (decoded.userId) {
      req.userId = decoded.userId;
      return next();
    } else {
      return res.status(403).json({
        message: "You are not logged in",
      });
    }
  } catch (error) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}
