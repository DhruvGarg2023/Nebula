-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('google', 'github', 'local');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "avatar_url" TEXT,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "auth_provider" "AuthProvider" NOT NULL,
    "google_id" VARCHAR(255),
    "password_hash" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,
    "deleted_at" TIMESTAMPTZ,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_google_id_key" ON "users"("google_id");

-- CreateIndex
CREATE INDEX "idx_users_name" ON "users"("name");

-- CreateIndex
CREATE INDEX "idx_users_deleted_at" ON "users"("deleted_at");
