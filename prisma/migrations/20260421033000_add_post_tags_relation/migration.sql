-- Create implicit many-to-many relation table between Post and Tag
CREATE TABLE "_PostToTag" (
  "A" TEXT NOT NULL,
  "B" TEXT NOT NULL
);

-- Ensure uniqueness of each post-tag pair
CREATE UNIQUE INDEX "_PostToTag_AB_unique" ON "_PostToTag"("A", "B");

-- Index for reverse lookups by tag
CREATE INDEX "_PostToTag_B_index" ON "_PostToTag"("B");

-- Foreign keys for relational integrity
ALTER TABLE "_PostToTag"
ADD CONSTRAINT "_PostToTag_A_fkey"
FOREIGN KEY ("A") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "_PostToTag"
ADD CONSTRAINT "_PostToTag_B_fkey"
FOREIGN KEY ("B") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;
