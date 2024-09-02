/*
  Warnings:

  - You are about to alter the column `locked_amount` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.
  - You are about to alter the column `pending_amount` on the `Balance` table. The data in that column could be lost. The data in that column will be cast from `DoublePrecision` to `BigInt`.

*/
-- AlterTable
ALTER TABLE "Balance" ALTER COLUMN "locked_amount" SET DEFAULT 0,
ALTER COLUMN "locked_amount" SET DATA TYPE BIGINT,
ALTER COLUMN "pending_amount" SET DEFAULT 0,
ALTER COLUMN "pending_amount" SET DATA TYPE BIGINT;

-- AlterTable
ALTER TABLE "Payout" ALTER COLUMN "amount" SET DATA TYPE BIGINT;
