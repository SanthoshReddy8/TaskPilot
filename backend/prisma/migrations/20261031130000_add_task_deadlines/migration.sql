DO $migration$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = current_schema()
      AND table_name = 'Task'
      AND column_name = 'dueDate'
      AND data_type <> 'date'
  ) THEN
    ALTER TABLE "Task"
      ALTER COLUMN "dueDate" TYPE DATE USING "dueDate"::date;
  END IF;
END
$migration$;

CREATE INDEX IF NOT EXISTS "Task_userId_dueDate_idx" ON "Task"("userId", "dueDate");