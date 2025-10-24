-- Migration: add_comments_model
-- Creates the Comment table and index for SQLite

CREATE TABLE IF NOT EXISTS "Comment" (
  "id" INTEGER PRIMARY KEY AUTOINCREMENT,
  "text" TEXT NOT NULL,
  "author" TEXT NOT NULL,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leadId" TEXT NOT NULL,
  FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "IDX_Comment_leadId" ON "Comment" ("leadId");