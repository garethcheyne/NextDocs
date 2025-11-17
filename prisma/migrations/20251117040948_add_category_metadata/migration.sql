-- CreateTable
CREATE TABLE "CategoryMetadata" (
    "id" TEXT NOT NULL,
    "repositoryId" TEXT NOT NULL,
    "categorySlug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryMetadata_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CategoryMetadata_repositoryId_idx" ON "CategoryMetadata"("repositoryId");

-- CreateIndex
CREATE UNIQUE INDEX "CategoryMetadata_repositoryId_categorySlug_key" ON "CategoryMetadata"("repositoryId", "categorySlug");

-- AddForeignKey
ALTER TABLE "CategoryMetadata" ADD CONSTRAINT "CategoryMetadata_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
