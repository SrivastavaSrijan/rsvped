-- AlterTable
ALTER TABLE "MembershipTier" ADD COLUMN     "benefits" TEXT[] DEFAULT ARRAY[]::TEXT[];
