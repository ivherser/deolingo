-- AlterTable
ALTER TABLE "VocabularyItem" ADD COLUMN     "cefrLevel" TEXT NOT NULL DEFAULT 'A1';

-- CreateIndex
CREATE INDEX "VocabularyItem_cefrLevel_topic_idx" ON "VocabularyItem"("cefrLevel", "topic");
