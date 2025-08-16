-- CreateEnum
CREATE TYPE "CommunityExclusivity" AS ENUM ('OPEN', 'INVITE_ONLY', 'APPLICATION_BASED');

-- AlterTable
ALTER TABLE "Community" ADD COLUMN     "exclusivity" "CommunityExclusivity" NOT NULL DEFAULT 'OPEN',
ADD COLUMN     "targetAudience" TEXT;
