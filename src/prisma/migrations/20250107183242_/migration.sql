-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Assistant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "personality" TEXT NOT NULL,
    "instructions" TEXT NOT NULL,
    "salesLink" TEXT,
    "scheduleLink" TEXT,
    "whatsappNumber" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "Assistant_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Assistant" ("createdAt", "id", "instructions", "model", "name", "personality", "salesLink", "scheduleLink", "updatedAt", "userId", "whatsappNumber") SELECT "createdAt", "id", "instructions", "model", "name", "personality", "salesLink", "scheduleLink", "updatedAt", "userId", "whatsappNumber" FROM "Assistant";
DROP TABLE "Assistant";
ALTER TABLE "new_Assistant" RENAME TO "Assistant";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
