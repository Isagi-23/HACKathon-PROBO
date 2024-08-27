/*
  Warnings:

  - Changed the type of `outcome` on the `Polls` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "Polls" DROP COLUMN "outcome",
ADD COLUMN     "outcome" JSONB NOT NULL;
