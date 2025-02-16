/*
  Warnings:

  - Added the required column `password` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "tokens" INTEGER NOT NULL DEFAULT 0,
    "availableMessages" INTEGER NOT NULL DEFAULT 50,
    "adViews" INTEGER NOT NULL DEFAULT 0,
    "lastAdView" DATETIME,
    "adCooldown" INTEGER NOT NULL DEFAULT 24,
    "settings" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("availableMessages", "createdAt", "email", "id", "name", "tokens", "updatedAt") SELECT "availableMessages", "createdAt", "email", "id", "name", "tokens", "updatedAt" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
