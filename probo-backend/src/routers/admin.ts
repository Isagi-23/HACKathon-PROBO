import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { ADMIN_JWT_SECRET } from "../configs";
import { adminAuthMiddleware } from "../middlewares/adminMiddleware";
import { AdminAuthenticatedRequest, PollPayloadSchema } from "../types";
import { handleError } from "../utils/errorUtilities";
import { getPollOptions, hasPollExpired } from "../utils/pollUtils";
const prismaClient = new PrismaClient();
const router = Router();

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await prismaClient.admin.findFirst({
    where: {
      email,
    },
  });
  if (!existingUser) {
    res.status(403).json({ message: "No Admin found with this email" });
    return;
  }

  if (existingUser.password !== password) {
    res.status(403).json({ message: "Incorrect password" });
    return;
  }
  const token = jwt.sign(
    {
      adminId: existingUser.id,
    },
    ADMIN_JWT_SECRET
  );

  res.json({
    token,
  });
});

router.post(
  "/create-poll",
  adminAuthMiddleware,
  async (req: AdminAuthenticatedRequest, res) => {
    if (!req.adminId) return;

    // const requiredFields = ["title", "options", "expiry", "outcome"];
    // const missingFields = requiredFields.filter((field) => !req.body[field]);
    // if (missingFields.length > 0) {
    //   res.status(400).json({
    //     message: `Missing required fields: ${missingFields.join(", ")}`,
    //   });
    //   return;
    // }
    try {
      const parsedBody = PollPayloadSchema.parse(req.body);
      const { title, image, options, expiry, outcome } = parsedBody;
      const createdPoll = await prismaClient.polls.create({
        data: {
          title: title,
          image: image,
          expiry: new Date(expiry),
          outcome: outcome,
          admin_id: req.adminId,
          poll_options: {
            create: options.map((option) => ({
              title: option,
            })),
          },
        },
        include: {
          poll_options: true,
        },
      });
      return res.status(201).json(createdPoll);
    } catch (error) {
      return handleError(error, res);
    }
  }
);

router.patch(
  "/update-outcome",
  adminAuthMiddleware,
  async (req: AdminAuthenticatedRequest, res) => {
    if (!req.adminId) return;
    const { pollId, pollOptionId } = req.body;
    try {
      const fetchOptions = await getPollOptions(pollId);
      if (
        !fetchOptions ||
        !fetchOptions.find((option) => option.id === pollOptionId)
      ) {
        return res.status(404).json({
          message: `Poll option with id ${pollOptionId} not found`,
        });
      }

      const currentPoll = await prismaClient.polls.findUnique({
        where: {
          id: pollId,
        },
      });

      if (!currentPoll) {
        return res.status(404).json({
          message: `Poll with id ${pollId} not found`,
        });
      }

      if (hasPollExpired(currentPoll.expiry)) {
        return res.status(400).json({
          message: "Poll has already expired",
        });
      }

      const updatedPoll = await prismaClient.polls.update({
        where: {
          id: pollId,
        },
        data: {
          outcome: { type: "DECLARED", result: pollOptionId },
          expiry: new Date(), // make expiry to the date of now to check expiry afterwarsd
        },
        include: {
          poll_options: true,
        },
      });
      console.log(updatedPoll);
      return res.status(200).json(updatedPoll);
    } catch (error) {
      return handleError(error, res);
    }
  }
);

export default router;
