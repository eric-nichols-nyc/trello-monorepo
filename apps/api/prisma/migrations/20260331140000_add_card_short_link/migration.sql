-- AlterTable
ALTER TABLE "Card" ADD COLUMN "shortLink" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Card_shortLink_key" ON "Card"("shortLink");
