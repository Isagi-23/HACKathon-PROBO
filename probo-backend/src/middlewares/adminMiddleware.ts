import { NextFunction, Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import { JWT_SECRET, ADMIN_JWT_SECRET } from "../configs";
import { AdminAuthenticatedRequest } from "../types";
export function adminAuthMiddleware(
  req: AdminAuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization ?? "";
  try {
    const token = authHeader.split(" ")[1];
    const {adminId=null} = jwt.verify(token, ADMIN_JWT_SECRET) as JwtPayload 
    if (adminId) {
      (req as AdminAuthenticatedRequest).adminId = adminId;
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
