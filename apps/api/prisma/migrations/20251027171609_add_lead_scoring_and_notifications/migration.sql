-- AlterTable
ALTER TABLE "demo_leads" ADD COLUMN     "contacted" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "contactedAt" TIMESTAMP(3),
ADD COLUMN     "conversionDate" TIMESTAMP(3),
ADD COLUMN     "convertedToCustomer" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "followUpDate" TIMESTAMP(3),
ADD COLUMN     "leadQuality" TEXT,
ADD COLUMN     "leadScore" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "mentionedInsurance" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mentionedPricing" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mentionedScheduling" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "qualificationNotes" TEXT,
ADD COLUMN     "questionsAsked" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "sentimentScore" DOUBLE PRECISION;

-- CreateTable
CREATE TABLE "notification_logs" (
    "id" TEXT NOT NULL,
    "leadId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deliveredAt" TIMESTAMP(3),
    "errorMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notification_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notification_logs_leadId_idx" ON "notification_logs"("leadId");

-- CreateIndex
CREATE INDEX "notification_logs_status_idx" ON "notification_logs"("status");

-- CreateIndex
CREATE INDEX "notification_logs_sentAt_idx" ON "notification_logs"("sentAt");

-- CreateIndex
CREATE INDEX "demo_leads_leadScore_idx" ON "demo_leads"("leadScore");

-- CreateIndex
CREATE INDEX "demo_leads_leadQuality_idx" ON "demo_leads"("leadQuality");

-- AddForeignKey
ALTER TABLE "notification_logs" ADD CONSTRAINT "notification_logs_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "demo_leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
