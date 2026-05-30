CREATE TABLE IF NOT EXISTS "password_reset_token" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "password_reset_token_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "password_reset_token_token_key" ON "password_reset_token"("token");
CREATE INDEX IF NOT EXISTS "password_reset_token_email_idx" ON "password_reset_token"("email");
