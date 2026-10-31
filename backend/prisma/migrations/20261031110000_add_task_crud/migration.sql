ALTER TABLE "Task"
  ALTER COLUMN "description" DROP NOT NULL,
  ALTER COLUMN "description" DROP DEFAULT;

DROP INDEX "Task_userId_idx";

CREATE INDEX "Task_userId_createdAt_idx" ON "Task"("userId", "createdAt");
