-- CreateEnum
CREATE TYPE "UserCohort" AS ENUM ('POWER', 'FRIEND_GROUP', 'CASUAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "userCohort" "UserCohort";
