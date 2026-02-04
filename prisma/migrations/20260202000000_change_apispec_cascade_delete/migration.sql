-- DropForeignKey
ALTER TABLE "APISpec" DROP CONSTRAINT IF EXISTS "APISpec_repositoryId_fkey";

-- AddForeignKey
ALTER TABLE "APISpec" ADD CONSTRAINT "APISpec_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;
