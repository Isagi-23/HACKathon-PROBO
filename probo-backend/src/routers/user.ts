import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, PRICE_ADJUSTMENT_FACTOR } from "../configs";
import { authMiddleware } from "../middlewares/userMiddleware";
import { UserAuthenticatedRequest } from "../types";
import { handleError } from "../utils/errorUtilities";
import { hasPollExpired } from "../utils/pollUtils";
const router = Router();

const prismaClient = new PrismaClient();

router.post("/signup", async (req, res) => {
  //add sign verfication here
  const { address } = req.body;
  // const hardcodedAddress = "23ecgUK3qxN57sjoqp89E6Co7S8GPaq4wDkKugyinJwd";
  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: address,
    },
  });
  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } else {
    const user = await prismaClient.user.create({
      data: {
        address: address,
        type: "USER",
        balance: {
          create: {
            amount: 0,
          },
        },
      },
    });

    const token = jwt.sign(
      {
        userId: user.id,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  }
});

router.get("/me", authMiddleware, (req: UserAuthenticatedRequest, res) => {
  res.send("ok");
});

router.post(
  "/vote",
  authMiddleware,
  async (req: UserAuthenticatedRequest, res) => {
    if (!req.userId) return res.status(401).json({ message: "Unauthorized" });

    const { pollId, optionId, amount } = req.body;

    try {
      await prismaClient.$transaction(async (prisma) => {
        const poll = await prisma.polls.findUnique({
          where: { id: pollId },
        });
        if (!poll || hasPollExpired(poll.expiry)) {
          throw new Error("Poll has expired or does not exist");
        }

        const existingSubmission = await prisma.submissions.findFirst({
          where: { user_id: req.userId, poll_id: pollId },
        });

        if (existingSubmission) {
          throw new Error("User has already voted on this poll");
        }
        if (!req.userId) return;
        // const userBalance = await prisma.balance.findUnique({
        //   where: { user_id: req.userId },
        // });
        // if (userBalance && userBalance.amount < parseFloat(amount)) {
        //   throw new Error("Insufficient balance");
        // }

        // await prisma.balance.update({
        //   where: { user_id: req.userId },
        //   data: {
        //     amount: { increment: parseFloat(amount) },
        //     locked_amount: { increment: parseFloat(amount) },
        //   },
        // });

        await prisma.submissions.create({
          data: {
            user_id: req.userId,
            option_id: optionId,
            poll_id: pollId,
            amount: parseFloat(amount),
          },
        });

        await prisma.pollsOption.update({
          where: { id: optionId },
          data: {
            total_bets: {
              increment: parseFloat(amount),
            },
          },
        });

        const updatedPoll = await prisma.polls.update({
          where: { id: pollId },
          data: {
            total_bets: {
              increment: parseFloat(amount),
            },
          },
        });

        const pollOption = await prisma.pollsOption.findUnique({
          where: { id: optionId },
        });
        if (!pollOption) throw new Error("Poll option not found");

        const totalBetsOnOption = pollOption.total_bets;
        const totalBetsOnPoll = updatedPoll.total_bets;
        const priceAdjustmentFactor = PRICE_ADJUSTMENT_FACTOR;
        const newPrice =
          pollOption.dynamic_price +
          (parseFloat(amount) / totalBetsOnPoll) * priceAdjustmentFactor;

        console.log(
          newPrice + " " + parseFloat(amount) + "newPRice",
          updatedPoll.total_bets
        );

        await prisma.pollsOption.update({
          where: { id: optionId },
          data: { dynamic_price: newPrice, total_bets: totalBetsOnOption },
        });

        return res.status(200).json({ message: "Vote successfully placed" });
      });
    } catch (error) {
      console.log(error);
      return handleError(error, res);
    }
  }
);

router.post(
  "/initiate-payout",
  authMiddleware,
  async (req: UserAuthenticatedRequest, res) => {
    const userId = req.userId;
    if (!userId) return;
    const user = await prismaClient.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) return;

    const address = user.address;
    const txnId="123213123"

    await prismaClient.$transaction(async (prisma) => {
      const userBalance = await prisma.balance.findUnique({
        where: { user_id: userId },
      });
      if (userBalance && userBalance.pending_amount > 0) {
        await prisma.balance.update({
          where: { user_id: userId },
          data: {
            pending_amount: {
              decrement: userBalance.pending_amount,
            },
            locked_amount: {
              increment:userBalance.pending_amount
            },
          },
        });
        await prisma.payout.create({
          data:{
            userId: userId,
            amount: userBalance.pending_amount,
            status: "PENDING",
            signature: txnId
          }
        })
      }
      //web 3 stuff 

      res.json({message:"processing",amount:userBalance?.pending_amount})
    });
  }
);

export default router;
