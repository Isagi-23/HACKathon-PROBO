import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
import { authMiddleware } from "../middlewares/userMiddleware";
import { UserAuthenticatedRequest } from "../types";
const router = Router();

const prismaClient = new PrismaClient();

router.post("/signup", async (req, res) => {
  //add sign verfication here
  const hardcodedAddress = "23ecgUK3qxN57sjoqp89E6Co7S8GPaq4wDkKugyinJwd";
  const existingUser = await prismaClient.user.findFirst({
    where: {
      address: hardcodedAddress,
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
        address: hardcodedAddress,
        type: "USER",
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
  console.log("req", req.userId);
  res.send("ok");
});

export default router;
