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
              dynamic_price: 0.5,
              initial_price: 0.5,
              total_bets: 0,
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
          submissions: {
            updateMany: {
              where: {
                option_id: pollOptionId,
              },
              data: {
                isWinner: true,
              },
            },
          },
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

router.get("/transfer-balance/:pollId", adminAuthMiddleware, async (req, res) => {
  const { pollId } = req.params;
  try {
    const payoutResults = await prismaClient.$transaction(async (prisma) => {
      const poll = await prisma.polls.findUnique({
        where: { id: parseInt(pollId) },
        include: { poll_options: true, submissions: true },
      });
      if (!poll || !hasPollExpired(poll.expiry)) {
        console.log(poll);
        throw new Error("Poll has not expired yet or does not exist");
      }
      if(poll.balanceCalculated) {
        res.json({message: "Balance already calculated for Users"})
        return
      }

      const totalBetsOnPoll = poll.total_bets;
      const platformFee = 0.01;
      const amountAvailableForPayout = totalBetsOnPoll * (1 - platformFee);
      const pollOutcome = poll.outcome;
      console.log(pollOutcome);
      //@ts-ignore
      const winningOptionId = pollOutcome?.result && pollOutcome.result;
      const winningOption = poll.poll_options.find(
        (option) => option.id === winningOptionId
      );

      if (!winningOption) {
        throw new Error("Winning option does not exist for this poll");
      }

      const totalBetsOnWinningOption = winningOption.total_bets;

      const userSubmissions = await prisma.submissions.findMany({
        where: { poll_id: parseInt(pollId), option_id: winningOptionId },
      });
      const payouts = userSubmissions.map((submission) => {
        const userBetAmount = submission.amount;
        const payout =
          (userBetAmount / totalBetsOnWinningOption) * amountAvailableForPayout;
        return { userId: submission.user_id, payout };
      });
   
      await Promise.all(
        payouts.map(({ userId, payout }) =>
          prisma.balance.updateMany({
            where: { user_id: userId },
            data: { amount: { increment: payout },pending_amount: { increment: payout } },
          })
        )
      );

      await prismaClient.polls.update({
        where: { id: parseInt(pollId) },
        data: {
          balanceCalculated: true,
        },
      });

      return payouts
    });

    return res.status(200).json(payoutResults);
  } catch (error) {
    return handleError(error, res);
  }
});

export default router;
