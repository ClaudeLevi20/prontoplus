-- CreateEnum
CREATE TYPE "TestRunStatus" AS ENUM ('RUNNING', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateTable
CREATE TABLE "test_runs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "TestRunStatus" NOT NULL DEFAULT 'RUNNING',
    "scenariosRun" INTEGER NOT NULL DEFAULT 0,
    "scenariosTotal" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "summary" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "test_results" (
    "id" TEXT NOT NULL,
    "testRunId" TEXT NOT NULL,
    "scenarioId" TEXT NOT NULL,
    "scenarioName" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "twilioCallSid" TEXT,
    "telnyxCallId" TEXT,
    "recordingUrl" TEXT,
    "transcriptText" TEXT,
    "callDuration" INTEGER NOT NULL,
    "initialResponseTime" INTEGER,
    "avgResponseTime" INTEGER,
    "maxResponseTime" INTEGER,
    "awkwardPauses" INTEGER NOT NULL DEFAULT 0,
    "naturalness" DOUBLE PRECISION,
    "professionalism" DOUBLE PRECISION,
    "accuracy" DOUBLE PRECISION,
    "correctAnswers" INTEGER NOT NULL DEFAULT 0,
    "incorrectAnswers" INTEGER NOT NULL DEFAULT 0,
    "hallucinations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "inaccuracies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "errors" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "interruptions" INTEGER NOT NULL DEFAULT 0,
    "aiEvaluation" JSONB,
    "recommendations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "test_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "test_runs_status_idx" ON "test_runs"("status");

-- CreateIndex
CREATE INDEX "test_runs_startedAt_idx" ON "test_runs"("startedAt");

-- CreateIndex
CREATE INDEX "test_results_testRunId_idx" ON "test_results"("testRunId");

-- CreateIndex
CREATE INDEX "test_results_scenarioId_idx" ON "test_results"("scenarioId");

-- CreateIndex
CREATE INDEX "test_results_category_idx" ON "test_results"("category");

-- CreateIndex
CREATE INDEX "test_results_passed_idx" ON "test_results"("passed");

-- AddForeignKey
ALTER TABLE "test_results" ADD CONSTRAINT "test_results_testRunId_fkey" FOREIGN KEY ("testRunId") REFERENCES "test_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
