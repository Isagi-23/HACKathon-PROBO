import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET, PRICE_ADJUSTMENT_FACTOR } from "../configs";
import { authMiddleware } from "../middlewares/userMiddleware";
import { UserAuthenticatedRequest } from "../types";
import { handleError } from "../utils/errorUtilities";
import { hasPollExpired } from "../utils/pollUtils";
import nacl from "tweetnacl";
import {
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  RpcResponseAndContext,
  sendAndConfirmTransaction,
  SignatureResult,
  SystemProgram,
  Transaction,
  TransactionConfirmationStrategy,
} from "@solana/web3.js";
import { verifySignatureFromTransaction } from "../utils/verifyTransaction";
import bs58 from "bs58";

const router = Router();

const prismaClient = new PrismaClient();
const connection = new Connection("https://api.devnet.solana.com");
const PARENTWALLET = process.env.PARENTWALLET_ADMIN ?? "";
console.log(PARENTWALLET);

router.post("/signup", async (req, res) => {
  //zod validation
  const { address, signature } = req.body;
  const message = process.env.MESSAGE ?? "";
  const encodedMessage = new TextEncoder().encode(message);
  const verify = nacl.sign.detached.verify(
    encodedMessage,
    new Uint8Array(signature.data),
    new PublicKey(address).toBytes()
  );

  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: address,
    },
    include: {
      balance: true,
    },
  });
  if (existingUser) {
    const token = jwt.sign(
      {
        userId: existingUser.id,
        address: existingUser.address,
      },
      JWT_SECRET
    );
    res.json({
      token,
      totalEarned: existingUser?.balance?.amount ?? 0 / 1000_000_000,
      totalWallet: existingUser?.balance?.pending_amount ?? 0 / 1000_000_000,
      totalWithrawing: existingUser?.balance?.locked_amount ?? 0 / 1000_000_000,
    });
  } else {
    if (!verify) {
      return res.status(401).send("Invalid signature");
    }
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
        address: user.address,
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  }
});

router.post(
  "/vote",
  authMiddleware,
  async (req: UserAuthenticatedRequest, res) => {
    if (!req.userId && !req.address)
      return res.status(401).json({ message: "Unauthorized" });
    console.log("first", connection);
    const { pollId, optionId, amount, signature } = req.body;
    console.log(signature);
    const transaction = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 1,
    });

    console.log(transaction, req.address);
    const transactionVerified = await verifySignatureFromTransaction(
      transaction,
      new PublicKey(PARENTWALLET),
      req.address!
    );
    console.log(transactionVerified);

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
    if (!userId) {
      return res.status(400).json({ error: "User ID not found" });
    }

    try {
      const user = await prismaClient.user.findUnique({
        where: { id: userId },
        include: { balance: true },
      });

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const { address, balance } = user;
      if (!address) {
        return res.status(400).json({ error: "User address not found" });
      }

      // Validate Solana address
      let recipientPubKey;
      try {
        recipientPubKey = new PublicKey(address);
      } catch (e) {
        return res.status(400).json({ error: "Invalid Solana address" });
      }

      const payoutAmount = balance?.pending_amount ?? 0;
      if (payoutAmount <= 0) {
        return res
          .status(400)
          .json({ error: "Insufficient pending amount for payout" });
      }

      const lamportsToSend = payoutAmount;

      // Check parent wallet balance
      const parentBalance = await connection.getBalance(
        new PublicKey(PARENTWALLET)
      );
      const estimatedFee = 5000; // Example fee estimate; adjust as needed
      if (parentBalance < lamportsToSend + estimatedFee) {
        return res
          .status(500)
          .json({ error: "Insufficient funds in the parent wallet" });
      }

      // Create transaction
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: new PublicKey(PARENTWALLET),
          toPubkey: recipientPubKey,
          lamports: lamportsToSend,
        })
      );

      // Load keypair securely
      const secretKey = process.env.SOLANA_SECRET_KEY!;
      if (!secretKey) {
        return res.status(500).json({ message: "Server misconfiguration" });
      }

      const keypair = Keypair.fromSecretKey(bs58.decode(secretKey));

      // Send transaction with 'finalized' commitment
      const signature = await sendAndConfirmTransaction(
        connection,
        transaction,
        [keypair],
        { commitment: "finalized" }
      );

      // Update database within a transaction
      const payoutId = await prismaClient.$transaction(async (prisma) => {
        await prisma.$executeRawUnsafe(
          `SELECT * FROM "Balance" WHERE user_id = $1 FOR UPDATE`,
          userId
        );
        const currentBalance = await prisma.balance.findUnique({
          where: { user_id: userId },
        });

        if (!currentBalance || currentBalance.pending_amount < payoutAmount) {
          throw new Error(
            "Insufficient pending amount during payout processing"
          );
        }

        const updatedBalance = await prisma.balance.update({
          where: { user_id: userId },
          data: {
            pending_amount: { decrement: payoutAmount },
            locked_amount: { increment: payoutAmount },
          },
        });

        if (!updatedBalance) {
          throw new Error("Failed to update balance during payout processing");
        }

        const payout = await prisma.payout.create({
          data: {
            userId: userId,
            amount: payoutAmount,
            status: "COMPLETED", // Already confirmed
            signature: signature,
          },
        });

        if (!payout) {
          throw new Error("Failed to create payout record");
        }
        return payout.id;
      });

      return res.json({
        message: "Success",
        amount: payoutAmount,
        payoutId: payoutId,
        signature: signature,
      });
    } catch (error: any) {
      console.error("Error processing payout:", error);
      // Handle specific errors if possible
      if (error.message.includes("Insufficient pending amount")) {
        return res
          .status(400)
          .json({ error: "Insufficient pending amount for payout" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  }
);

router.get(
  "/all-polls",
  authMiddleware,
  async (req: UserAuthenticatedRequest, res) => {
    if (!req.userId) return;
    const polls = await prismaClient.polls.findMany({
      include: {
        poll_options: true,
        submissions: {
          where: {
            user_id: req.userId,
          },
        },
        _count: { select: { submissions: true } },
      },
    });
    const pollsResponse = polls.map((poll) => {
      return {
        id: poll.id,
        title: poll.title,
        subtitle: poll.subtitle,
        image: poll.image,
        expiry: poll.expiry,
        outcome: poll.outcome,
        pot: poll.total_bets,
        totalVotes: poll._count.submissions,
        options: poll.poll_options.map((option) => ({
          title: option.title,
          id: option.id,
          prob: option.dynamic_price,
        })),
        submissions: poll.submissions,
      };
    });
    res.json(pollsResponse);
  }
);

router.get(
  "/wallet-data",
  authMiddleware,
  async (req: UserAuthenticatedRequest, res) => {
    if (!req.userId) return;
    const balance = await prismaClient.balance.findUnique({
      where: {
        user_id: req.userId,
      },
    });
    const walletBalance = {
      totalEarned: (balance?.amount ?? 0) / 1000_000_000,
      totalWallet: (balance?.pending_amount ?? 0) / 1000_000_000,
      totalWithrawing: (balance?.locked_amount ?? 0) / 1000_000_000,
    };
    res.json(walletBalance);
  }
);

export default router;
