-- CreateTable
CREATE TABLE "RepositoryImage" (
  "id" TEXT NOT NULL,
  "repositoryId" TEXT NOT NULL,
  "filePath" TEXT NOT NULL,
  "localPath" TEXT NOT NULL,
  "sha" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "mimeType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  "lastSyncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "RepositoryImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RepositoryImage_repositoryId_filePath_key" ON "RepositoryImage"("repositoryId", "filePath");

-- CreateIndex
CREATE INDEX "RepositoryImage_repositoryId_idx" ON "RepositoryImage"("repositoryId");

-- CreateIndex
CREATE INDEX "RepositoryImage_sha_idx" ON "RepositoryImage"("sha");

-- AddForeignKey
ALTER TABLE "RepositoryImage" ADD CONSTRAINT "RepositoryImage_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
