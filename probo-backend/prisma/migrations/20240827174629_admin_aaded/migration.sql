/*
  Warnings:

  - You are about to drop the column `user_id` on the `Polls` table. All the data in the column will be lost.
  - Added the required column `admin_id` to the `Polls` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Polls" DROP CONSTRAINT "Polls_user_id_fkey";

-- AlterTable
ALTER TABLE "Polls" DROP COLUMN "user_id",
ADD COLUMN     "admin_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "Admin" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" "UserType" NOT NULL,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Polls" ADD CONSTRAINT "Polls_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "Admin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
