-- CreateTable
CREATE TABLE "files" (
    "id" UUID NOT NULL,
    "room_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "language" VARCHAR(50) NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_files_room_id" ON "files"("room_id");

-- CreateIndex
CREATE UNIQUE INDEX "idx_files_room_name" ON "files"("room_id", "name");

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_room_id_fkey" FOREIGN KEY ("room_id") REFERENCES "rooms"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER INDEX "room_members_room_id_user_id_key" RENAME TO "idx_room_members_room_user";
