-- CreateEnum
CREATE TYPE "MembershipRole" AS ENUM ('MEMBER', 'MODERATOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'PAST_DUE', 'CANCELED');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EventVisibility" AS ENUM ('PUBLIC', 'PRIVATE', 'MEMBER_ONLY');

-- CreateEnum
CREATE TYPE "LocationType" AS ENUM ('PHYSICAL', 'ONLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "TicketVisibility" AS ENUM ('PUBLIC', 'CODE_REQUIRED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PAID', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCEEDED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('AMOUNT', 'PERCENT');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SHORT_TEXT', 'LONG_TEXT', 'SINGLE_SELECT', 'MULTI_SELECT', 'CHECKBOX', 'TERMS', 'SIGNATURE');

-- CreateEnum
CREATE TYPE "RsvpStatus" AS ENUM ('CONFIRMED', 'CANCELLED', 'WAITLIST');

-- CreateEnum
CREATE TYPE "PaymentState" AS ENUM ('NONE', 'PENDING', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "EventRole" AS ENUM ('CO_HOST', 'MANAGER', 'CHECKIN');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT,
    "emailVerified" TIMESTAMP(3),
    "image" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("provider","providerAccountId")
);

-- CreateTable
CREATE TABLE "Session" (
    "sessionToken" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VerificationToken_pkey" PRIMARY KEY ("identifier","token")
);

-- CreateTable
CREATE TABLE "Community" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "coverImage" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Community_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CommunityMembership" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "role" "MembershipRole" NOT NULL DEFAULT 'MEMBER',
    "membershipTierId" TEXT,
    "subscriptionStatus" "SubscriptionStatus",
    "expiresAt" TIMESTAMP(3),
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CommunityMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MembershipTier" (
    "id" TEXT NOT NULL,
    "communityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER,
    "currency" TEXT,
    "billingInterval" "BillingInterval",
    "stripePriceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MembershipTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "description" TEXT,
    "coverImage" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "timezone" TEXT NOT NULL,
    "locationType" "LocationType" NOT NULL,
    "venueName" TEXT,
    "venueAddress" TEXT,
    "onlineUrl" TEXT,
    "capacity" INTEGER,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "status" "EventStatus" NOT NULL DEFAULT 'DRAFT',
    "visibility" "EventVisibility" NOT NULL DEFAULT 'PUBLIC',
    "publishedAt" TIMESTAMP(3),
    "requiresApproval" BOOLEAN NOT NULL DEFAULT false,
    "locationHiddenUntilApproved" BOOLEAN NOT NULL DEFAULT false,
    "hostId" TEXT NOT NULL,
    "communityId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "rsvpCount" INTEGER NOT NULL DEFAULT 0,
    "paidRsvpCount" INTEGER NOT NULL DEFAULT 0,
    "checkInCount" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCategory" (
    "eventId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "EventCategory_pkey" PRIMARY KEY ("eventId","categoryId")
);

-- CreateTable
CREATE TABLE "TicketTier" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "priceCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "quantityTotal" INTEGER,
    "quantitySold" INTEGER NOT NULL DEFAULT 0,
    "visibility" "TicketVisibility" NOT NULL DEFAULT 'PUBLIC',
    "salesStart" TIMESTAMP(3),
    "salesEnd" TIMESTAMP(3),

    CONSTRAINT "TicketTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "purchaserEmail" TEXT NOT NULL,
    "purchaserName" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "totalCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "refundedCents" INTEGER NOT NULL DEFAULT 0,
    "appliedPromoCodeId" TEXT,
    "idempotencyKey" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "ticketTierId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL DEFAULT 1,
    "provider" TEXT NOT NULL,
    "providerIntentId" TEXT,
    "providerChargeId" TEXT,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amountCents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Refund" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "amountCents" INTEGER NOT NULL,
    "reason" TEXT,
    "providerRefundId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Refund_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCode" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "discountType" "DiscountType" NOT NULL,
    "amountOffCents" INTEGER,
    "percentOff" INTEGER,
    "maxRedemptions" INTEGER,
    "redeemedCount" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "appliesToAllTiers" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "PromoCode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PromoCodeTier" (
    "promoCodeId" TEXT NOT NULL,
    "ticketTierId" TEXT NOT NULL,

    CONSTRAINT "PromoCodeTier_pkey" PRIMARY KEY ("promoCodeId","ticketTierId")
);

-- CreateTable
CREATE TABLE "RegistrationQuestion" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "label" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL,
    "options" TEXT[],

    CONSTRAINT "RegistrationQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistrationAnswer" (
    "id" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "RegistrationAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rsvp" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "ticketTierId" TEXT,
    "userId" TEXT,
    "orderId" TEXT,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "status" "RsvpStatus" NOT NULL DEFAULT 'CONFIRMED',
    "paymentState" "PaymentState" NOT NULL DEFAULT 'NONE',
    "waitlistPosition" INTEGER,
    "referralId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rsvp_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckIn" (
    "id" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "scannedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventCollaborator" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "EventRole" NOT NULL,

    CONSTRAINT "EventCollaborator_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventMessage" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "content" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventReferral" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "code" TEXT NOT NULL,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventReferral_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventFeedback" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "rsvpId" TEXT NOT NULL,
    "rating" INTEGER,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventFeedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventView" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "userId" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EventView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventDailyStat" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "uniqueViews" INTEGER NOT NULL DEFAULT 0,
    "rsvps" INTEGER NOT NULL DEFAULT 0,
    "paidRsvps" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "EventDailyStat_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Session_sessionToken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "Community_slug_key" ON "Community"("slug");

-- CreateIndex
CREATE INDEX "CommunityMembership_communityId_role_idx" ON "CommunityMembership"("communityId", "role");

-- CreateIndex
CREATE UNIQUE INDEX "CommunityMembership_userId_communityId_key" ON "CommunityMembership"("userId", "communityId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_slug_key" ON "Event"("slug");

-- CreateIndex
CREATE INDEX "Event_communityId_idx" ON "Event"("communityId");

-- CreateIndex
CREATE INDEX "Event_publishedAt_idx" ON "Event"("publishedAt");

-- CreateIndex
CREATE INDEX "Event_visibility_status_idx" ON "Event"("visibility", "status");

-- CreateIndex
CREATE INDEX "Event_deletedAt_idx" ON "Event"("deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "TicketTier_eventId_idx" ON "TicketTier"("eventId");

-- CreateIndex
CREATE INDEX "TicketTier_eventId_visibility_idx" ON "TicketTier"("eventId", "visibility");

-- CreateIndex
CREATE UNIQUE INDEX "Order_idempotencyKey_key" ON "Order"("idempotencyKey");

-- CreateIndex
CREATE INDEX "Order_eventId_idx" ON "Order"("eventId");

-- CreateIndex
CREATE INDEX "Order_eventId_status_idx" ON "Order"("eventId", "status");

-- CreateIndex
CREATE INDEX "OrderItem_orderId_idx" ON "OrderItem"("orderId");

-- CreateIndex
CREATE INDEX "OrderItem_ticketTierId_idx" ON "OrderItem"("ticketTierId");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_orderId_attemptNumber_key" ON "Payment"("orderId", "attemptNumber");

-- CreateIndex
CREATE INDEX "PromoCode_eventId_code_idx" ON "PromoCode"("eventId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "PromoCode_eventId_code_key" ON "PromoCode"("eventId", "code");

-- CreateIndex
CREATE INDEX "RegistrationQuestion_eventId_position_idx" ON "RegistrationQuestion"("eventId", "position");

-- CreateIndex
CREATE INDEX "RegistrationAnswer_questionId_idx" ON "RegistrationAnswer"("questionId");

-- CreateIndex
CREATE INDEX "RegistrationAnswer_rsvpId_idx" ON "RegistrationAnswer"("rsvpId");

-- CreateIndex
CREATE INDEX "Rsvp_eventId_email_idx" ON "Rsvp"("eventId", "email");

-- CreateIndex
CREATE INDEX "Rsvp_eventId_status_idx" ON "Rsvp"("eventId", "status");

-- CreateIndex
CREATE INDEX "Rsvp_eventId_status_waitlistPosition_idx" ON "Rsvp"("eventId", "status", "waitlistPosition");

-- CreateIndex
CREATE UNIQUE INDEX "CheckIn_rsvpId_key" ON "CheckIn"("rsvpId");

-- CreateIndex
CREATE UNIQUE INDEX "EventCollaborator_eventId_userId_key" ON "EventCollaborator"("eventId", "userId");

-- CreateIndex
CREATE INDEX "EventMessage_eventId_createdAt_idx" ON "EventMessage"("eventId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "EventReferral_code_key" ON "EventReferral"("code");

-- CreateIndex
CREATE INDEX "EventReferral_eventId_idx" ON "EventReferral"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "EventFeedback_eventId_rsvpId_key" ON "EventFeedback"("eventId", "rsvpId");

-- CreateIndex
CREATE INDEX "EventView_eventId_viewedAt_idx" ON "EventView"("eventId", "viewedAt");

-- CreateIndex
CREATE INDEX "EventDailyStat_date_idx" ON "EventDailyStat"("date");

-- CreateIndex
CREATE UNIQUE INDEX "EventDailyStat_eventId_date_key" ON "EventDailyStat"("eventId", "date");

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Community" ADD CONSTRAINT "Community_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_membershipTierId_fkey" FOREIGN KEY ("membershipTierId") REFERENCES "MembershipTier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CommunityMembership" ADD CONSTRAINT "CommunityMembership_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MembershipTier" ADD CONSTRAINT "MembershipTier_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_hostId_fkey" FOREIGN KEY ("hostId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_communityId_fkey" FOREIGN KEY ("communityId") REFERENCES "Community"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCategory" ADD CONSTRAINT "EventCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketTier" ADD CONSTRAINT "TicketTier_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_appliedPromoCodeId_fkey" FOREIGN KEY ("appliedPromoCodeId") REFERENCES "PromoCode"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "TicketTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Refund" ADD CONSTRAINT "Refund_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "Payment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCode" ADD CONSTRAINT "PromoCode_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeTier" ADD CONSTRAINT "PromoCodeTier_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "PromoCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PromoCodeTier" ADD CONSTRAINT "PromoCodeTier_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "TicketTier"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationQuestion" ADD CONSTRAINT "RegistrationQuestion_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationAnswer" ADD CONSTRAINT "RegistrationAnswer_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "Rsvp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RegistrationAnswer" ADD CONSTRAINT "RegistrationAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "RegistrationQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_ticketTierId_fkey" FOREIGN KEY ("ticketTierId") REFERENCES "TicketTier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rsvp" ADD CONSTRAINT "Rsvp_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "EventReferral"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CheckIn" ADD CONSTRAINT "CheckIn_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "Rsvp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCollaborator" ADD CONSTRAINT "EventCollaborator_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventCollaborator" ADD CONSTRAINT "EventCollaborator_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMessage" ADD CONSTRAINT "EventMessage_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMessage" ADD CONSTRAINT "EventMessage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventMessage" ADD CONSTRAINT "EventMessage_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "EventMessage"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReferral" ADD CONSTRAINT "EventReferral_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventReferral" ADD CONSTRAINT "EventReferral_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventFeedback" ADD CONSTRAINT "EventFeedback_rsvpId_fkey" FOREIGN KEY ("rsvpId") REFERENCES "Rsvp"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventView" ADD CONSTRAINT "EventView_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventView" ADD CONSTRAINT "EventView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventDailyStat" ADD CONSTRAINT "EventDailyStat_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
