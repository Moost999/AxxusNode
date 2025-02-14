/*
  Warnings:

  - You are about to drop the column `whatsappNumber` on the `Assistant` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assistant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Assistant" ("createdAt", "id", "instructions", "model", "name", "personality", "updatedAt") SELECT "createdAt", "id", "instructions", "model", "name", "personality", "updatedAt" FROM "Assistant";
DROP TABLE "Assistant";
ALTER TABLE "new_Assistant" RENAME TO "Assistant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
