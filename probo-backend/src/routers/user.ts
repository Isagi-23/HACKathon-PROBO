import { PrismaClient } from "@prisma/client";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../configs";
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
export default router;
