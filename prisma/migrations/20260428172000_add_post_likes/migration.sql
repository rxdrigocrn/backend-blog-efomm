-- CreateTable PostLike
CREATE TABLE "PostLike" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT,
  "ip" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostLike_pkey" PRIMARY KEY ("id")
);

-- Unique constraints
CREATE UNIQUE INDEX "PostLike_postId_userId_unique" ON "PostLike"("postId","userId");
CREATE UNIQUE INDEX "PostLike_postId_ip_unique" ON "PostLike"("postId","ip");

-- Index
CREATE INDEX "PostLike_postId_idx" ON "PostLike"("postId");

-- Foreign key to Post
ALTER TABLE "PostLike"
ADD CONSTRAINT "PostLike_postId_fkey"
FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
