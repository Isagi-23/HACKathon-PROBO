import { Request } from "express";
import { z } from "zod";
export interface UserAuthenticatedRequest extends Request {
  userId?: number;
  address?: string;
}

export interface AdminAuthenticatedRequest extends Request {
  adminId?: number;
}

const OutcomeTypeEnum = z.enum(["DECLARED", "NOT_DECLARED"]);

export const PollPayloadSchema = z.object({
  title: z.string(),
  image: z.string().optional(),
  subtitle: z.string().optional(),
  options: z.array(z.string()),
  expiry: z.string(), //add custom date checks
  outcome: z.object({
    type: OutcomeTypeEnum,
    result: z.union([z.string(), z.number()]),
  }),
});
