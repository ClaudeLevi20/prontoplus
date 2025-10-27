-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('INITIATED', 'RINGING', 'ANSWERED', 'COMPLETED', 'FAILED', 'BUSY', 'NO_ANSWER');

-- CreateEnum
CREATE TYPE "CallDirection" AS ENUM ('INBOUND', 'OUTBOUND');

-- CreateEnum
CREATE TYPE "LeadInterest" AS ENUM ('HOT', 'WARM', 'COLD', 'UNQUALIFIED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "practices" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "address" TEXT,
    "ownerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "practices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "calls" (
    "id" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "callerName" TEXT,
    "callDuration" INTEGER NOT NULL,
    "recordingUrl" TEXT,
    "transcriptUrl" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'INITIATED',
    "telnyxCallId" TEXT NOT NULL,
    "telnyxCallControlId" TEXT,
    "direction" "CallDirection" NOT NULL DEFAULT 'INBOUND',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "answeredAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "calls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "demo_leads" (
    "id" TEXT NOT NULL,
    "callId" TEXT NOT NULL,
    "callerPhone" TEXT,
    "email" TEXT,
    "name" TEXT,
    "practiceName" TEXT,
    "interestLevel" "LeadInterest",
    "notes" TEXT,
    "captured" BOOLEAN NOT NULL DEFAULT false,
    "capturedAt" TIMESTAMP(3),
    "followUpSent" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "demo_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "practices_ownerId_idx" ON "practices"("ownerId");

-- CreateIndex
CREATE INDEX "practices_email_idx" ON "practices"("email");

-- CreateIndex
CREATE UNIQUE INDEX "calls_telnyxCallId_key" ON "calls"("telnyxCallId");

-- CreateIndex
CREATE INDEX "calls_telnyxCallId_idx" ON "calls"("telnyxCallId");

-- CreateIndex
CREATE INDEX "calls_status_idx" ON "calls"("status");

-- CreateIndex
CREATE INDEX "calls_startedAt_idx" ON "calls"("startedAt");

-- CreateIndex
CREATE UNIQUE INDEX "demo_leads_callId_key" ON "demo_leads"("callId");

-- CreateIndex
CREATE INDEX "demo_leads_callId_idx" ON "demo_leads"("callId");

-- CreateIndex
CREATE INDEX "demo_leads_captured_idx" ON "demo_leads"("captured");

-- CreateIndex
CREATE INDEX "demo_leads_createdAt_idx" ON "demo_leads"("createdAt");

-- AddForeignKey
ALTER TABLE "practices" ADD CONSTRAINT "practices_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "demo_leads" ADD CONSTRAINT "demo_leads_callId_fkey" FOREIGN KEY ("callId") REFERENCES "calls"("id") ON DELETE CASCADE ON UPDATE CASCADE;
