/*
  Warnings:

  - You are about to drop the column `patUpdatedAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `personalAccessToken` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rabbitmqPassword` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `rabbitmqUsername` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `tokenExpiresAt` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `username` on the `users` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[githubUsername]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "users_rabbitmqUsername_key";

-- DropIndex
DROP INDEX "users_username_key";

-- AlterTable
ALTER TABLE "users" DROP COLUMN "patUpdatedAt",
DROP COLUMN "personalAccessToken",
DROP COLUMN "rabbitmqPassword",
DROP COLUMN "rabbitmqUsername",
DROP COLUMN "tokenExpiresAt",
DROP COLUMN "username",
ADD COLUMN     "githubUsername" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_githubUsername_key" ON "users"("githubUsername");
