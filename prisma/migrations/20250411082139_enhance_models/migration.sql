-- CreateTable
CREATE TABLE "wechat_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "appId" TEXT NOT NULL,
    "appSecret" TEXT NOT NULL,
    "token" TEXT,
    "encodingKey" TEXT,
    "accessToken" TEXT,
    "expiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "desc" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_articles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT '草稿',
    "summary" TEXT,
    "tags" TEXT,
    "coverImage" TEXT,
    "publishedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "likeCount" INTEGER NOT NULL DEFAULT 0,
    "sourceType" TEXT NOT NULL DEFAULT 'manual',
    "sourceId" TEXT
);
INSERT INTO "new_articles" ("content", "createdAt", "id", "status", "title", "updatedAt") SELECT "content", "createdAt", "id", coalesce("status", '草稿') AS "status", "title", "updatedAt" FROM "articles";
DROP TABLE "articles";
ALTER TABLE "new_articles" RENAME TO "articles";
CREATE TABLE "new_chat_histories" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "messages" TEXT NOT NULL,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "modelId" TEXT,
    "summary" TEXT,
    "tags" TEXT,
    "category" TEXT NOT NULL DEFAULT 'general',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "tokenCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'active'
);
INSERT INTO "new_chat_histories" ("createdAt", "id", "messages", "title", "updatedAt", "userId") SELECT "createdAt", "id", "messages", "title", "updatedAt", "userId" FROM "chat_histories";
DROP TABLE "chat_histories";
ALTER TABLE "new_chat_histories" RENAME TO "chat_histories";
CREATE TABLE "new_chat_models" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL DEFAULT 'default',
    "provider" TEXT NOT NULL DEFAULT 'openai',
    "maxTokens" INTEGER,
    "temperature" REAL DEFAULT 0.7,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_chat_models" ("apiKey", "createdAt", "endpoint", "id", "isDefault", "model", "name", "updatedAt", "userId") SELECT "apiKey", "createdAt", "endpoint", "id", "isDefault", "model", "name", "updatedAt", "userId" FROM "chat_models";
DROP TABLE "chat_models";
ALTER TABLE "new_chat_models" RENAME TO "chat_models";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");
