-- DropIndex
DROP INDEX IF EXISTS "Role_name_key";

-- Create partial unique index
CREATE UNIQUE INDEX "Role_name_key"
ON "Role"("name")
WHERE "deletedAt" IS NULL;
