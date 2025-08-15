-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('JUNIOR', 'MID', 'SENIOR', 'EXECUTIVE');

-- CreateEnum
CREATE TYPE "NetworkingStyle" AS ENUM ('ACTIVE', 'SELECTIVE', 'CASUAL');

-- CreateEnum
CREATE TYPE "SpendingPower" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "experienceLevel" "ExperienceLevel",
ADD COLUMN     "industry" TEXT,
ADD COLUMN     "interests" TEXT[],
ADD COLUMN     "networkingStyle" "NetworkingStyle",
ADD COLUMN     "profession" TEXT,
ADD COLUMN     "spendingPower" "SpendingPower";
