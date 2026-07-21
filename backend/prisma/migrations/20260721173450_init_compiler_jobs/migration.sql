-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('queued', 'running', 'completed', 'failed', 'timeout');

-- CreateTable
CREATE TABLE "compiler_jobs" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "file_id" UUID,
    "language" VARCHAR(50) NOT NULL,
    "source_code" TEXT NOT NULL,
    "stdout" TEXT,
    "stderr" TEXT,
    "exit_code" INTEGER,
    "status" "JobStatus" NOT NULL DEFAULT 'queued',
    "execution_time_ms" INTEGER,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMPTZ,

    CONSTRAINT "compiler_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_compiler_jobs_room" ON "compiler_jobs"("room_id", "created_at" DESC);

-- CreateIndex
CREATE INDEX "idx_compiler_jobs_user" ON "compiler_jobs"("user_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "compiler_jobs" ADD CONSTRAINT "compiler_jobs_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compiler_jobs" ADD CONSTRAINT "compiler_jobs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "compiler_jobs" ADD CONSTRAINT "compiler_jobs_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE SET NULL ON UPDATE CASCADE;
