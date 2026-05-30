-- Delete all existing entries (destructive migration)
DELETE FROM "changelog_entry";

-- Remove old columns
ALTER TABLE "changelog_entry" DROP COLUMN IF EXISTS "category";
ALTER TABLE "changelog_entry" DROP COLUMN IF EXISTS "body";

-- Add version column
ALTER TABLE "changelog_entry" ADD COLUMN IF NOT EXISTS "version" TEXT;

-- Create sections table
CREATE TABLE IF NOT EXISTS "changelog_section" (
    "id" TEXT NOT NULL,
    "entryId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    CONSTRAINT "changelog_section_pkey" PRIMARY KEY ("id")
);

-- Add foreign key constraint
ALTER TABLE "changelog_section" ADD CONSTRAINT "changelog_section_entryId_fkey"
    FOREIGN KEY ("entryId") REFERENCES "changelog_entry"("id") ON UPDATE CASCADE ON DELETE CASCADE;
