/*
  Warnings:

  - A unique constraint covering the columns `[slug,version]` on the table `APISpec` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "APISpec_slug_key";

-- CreateIndex
CREATE INDEX "APISpec_slug_idx" ON "APISpec"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "APISpec_slug_version_key" ON "APISpec"("slug", "version");
