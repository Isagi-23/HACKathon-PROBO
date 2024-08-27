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
    const decoded = jwt.verify(token, ADMIN_JWT_SECRET) as JwtPayload & {
      adminId?: number;
    };
    console.log(decoded);
    if (decoded.adminId) {
      (req as AdminAuthenticatedRequest).adminId = decoded.adminId;
      return next();
    } else {
      return res.status(403).json({
        message: "You are not logged in",
      });
    }
    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid token",
    });
  }
}
