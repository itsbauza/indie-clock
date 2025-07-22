/*
  Warnings:

  - You are about to drop the column `lastSyncAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the `contributions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "contributions" DROP CONSTRAINT "contributions_userId_fkey";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "lastSyncAt";

-- DropTable
DROP TABLE "contributions";
