-- AlterTable
ALTER TABLE "subscriber" ADD COLUMN "digestFrequency" TEXT NOT NULL DEFAULT 'weekly',
ADD COLUMN "lastDigestSentAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "subscriber_confirm_token" (
    "id" TEXT NOT NULL,
    "subscriberId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "subscriber_confirm_token_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_confirm_token_subscriberId_key" ON "subscriber_confirm_token"("subscriberId");

-- CreateIndex
CREATE UNIQUE INDEX "subscriber_confirm_token_token_key" ON "subscriber_confirm_token"("token");

-- AddForeignKey
ALTER TABLE "subscriber_confirm_token" ADD CONSTRAINT "subscriber_confirm_token_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "subscriber"("id") ON DELETE CASCADE;
