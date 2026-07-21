-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('USER', 'SYSTEM');

-- CreateTable
CREATE TABLE "messages" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "user_id" UUID,
    "content" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'USER',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_messages_room_created_at" ON "messages"("room_id", "created_at" DESC);

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
