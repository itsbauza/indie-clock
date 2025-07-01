/*
  Warnings:

  - You are about to drop the `sessions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_sessions` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "sessions" DROP CONSTRAINT "sessions_userId_fkey";

-- DropForeignKey
ALTER TABLE "user_sessions" DROP CONSTRAINT "user_sessions_userId_fkey";

-- DropTable
DROP TABLE "sessions";

-- DropTable
DROP TABLE "user_sessions";
