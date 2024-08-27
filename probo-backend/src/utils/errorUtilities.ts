import { ZodError } from "zod";
import { Response } from "express";

export function handleError(error: unknown, res: Response) {
  if (error instanceof ZodError) {
    // Handle Zod validation errors
    return res.status(400).json({
      message: "Invalid data provided",
      details: error.errors,
    });
  } else if (error instanceof Error) {
    // Handle generic JavaScript errors
    return res.status(500).json({
      message: error.message,
    });
  } else {
    // Handle unexpected unknown errors
    return res.status(500).json({
      message: "An unexpected error occurred",
    });
  }
}