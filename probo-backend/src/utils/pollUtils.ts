import { PrismaClient } from "@prisma/client";
import { handleError } from "./errorUtilities";

const prismaClient = new PrismaClient();
export const getPollOptions = async (pollId: number) => {
  try {
    const poll = await prismaClient.polls.findUnique({
      where: {
        id: pollId,
      },
      include: {
        poll_options: true,
      },
    });

    if (!poll) return null;
    return poll.poll_options;
  } catch (error) {
    throw new Error(
      `Failed to fetch poll options: ${(error as Error).message}`
    );
  }
};

export function hasPollExpired(expiryDate: Date): boolean {
  return new Date(expiryDate) < new Date();
}
