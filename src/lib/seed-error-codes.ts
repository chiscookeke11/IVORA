/**
 * Seed Script — Populates the ErrorCode collection in MongoDB
 *
 * Reads the hardcoded error dictionary from constants.ts and upserts
 * each entry into the ErrorCode collection. Safe to run multiple times
 * (uses upsert so it won't create duplicates).
 *
 * Usage: npx tsx src/lib/seed-error-codes.ts
 */

import "dotenv/config";
import { connectDB, disconnectDB } from "./db";
import { ErrorCode } from "../models/ErrorCode";
import { ERROR_CODE_DICTIONARY } from "./constants";

async function seed() {
  console.log("[seed] Starting error code seeding...");

  await connectDB();

  let created = 0;
  let updated = 0;

  for (const entry of ERROR_CODE_DICTIONARY) {
    const result = await ErrorCode.updateOne(
      { code: entry.code, provider: entry.provider },
      {
        $set: {
          meaning: entry.meaning,
          fixIfActive: entry.fixIfActive,
          fixIfExpired: entry.fixIfExpired,
          fixGeneric: entry.fixGeneric,
          isAutomatable: entry.isAutomatable,
          ussdCode: entry.ussdCode,
          severity: entry.severity,
          category: entry.category,
          isActive: true,
        },
      },
      { upsert: true },
    );

    if (result.upsertedCount > 0) {
      created++;
    } else {
      updated++;
    }
  }

  console.log(`[seed] Done. Created: ${created}, Updated: ${updated}, Total: ${ERROR_CODE_DICTIONARY.length}`);

  await disconnectDB();
  process.exit(0);
}

seed().catch((error) => {
  console.error("[seed] Failed:", error);
  process.exit(1);
});
