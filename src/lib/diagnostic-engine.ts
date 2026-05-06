/**
 * Diagnostic Engine
 *
 * Maps an error code + subscription status to actionable fix instructions.
 *
 * Lookup order:
 * 1. Query MongoDB (ErrorCode collection) for the latest data.
 * 2. Fall back to the hardcoded dictionary in constants.ts if DB is unavailable.
 */

import { ERROR_CODE_DICTIONARY, type ErrorCodeEntry } from "./constants";
import { ErrorCode } from "../models/ErrorCode";

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface DiagnosticResult {
  /** The error code that was looked up. */
  errorCode: string;
  /** Human-readable meaning of the error. */
  meaning: string;
  /** Step-by-step fix instructions tailored to subscription status. */
  fixInstructions: string;
  /** Whether this error can potentially be fixed remotely. */
  isAutomatable: boolean;
  /** USSD code for self-service fix, if applicable. */
  ussdCode: string | null;
  /** Severity level. */
  severity: string;
  /** Error category. */
  category: string;
  /** Where the data came from. */
  source: "database" | "fallback";
}

// ────────────────────────────────────────────
// MongoDB Lookup
// ────────────────────────────────────────────

/**
 * Try to find an error code in MongoDB.
 * Returns null if DB is unavailable or entry not found.
 */
async function findInDatabase(
  errorCode: string,
  provider?: string,
): Promise<ErrorCodeEntry | null> {
  try {
    const normalizedCode = errorCode.trim();

    // Build query: case-insensitive match on code, optionally filtered by provider
    const query: Record<string, unknown> = {
      code: { $regex: new RegExp(`^${normalizedCode}$`, "i") },
      isActive: true,
    };

    if (provider) {
      query.$or = [{ provider }, { provider: "all" }];
    }

    const doc = await ErrorCode.findOne(query).lean().exec();

    if (!doc) return null;

    return {
      code: doc.code,
      provider: doc.provider,
      meaning: doc.meaning,
      fixIfActive: doc.fixIfActive,
      fixIfExpired: doc.fixIfExpired,
      fixGeneric: doc.fixGeneric,
      isAutomatable: doc.isAutomatable,
      ussdCode: doc.ussdCode,
      severity: doc.severity,
      category: doc.category,
    };
  } catch (error) {
    console.warn(
      "[diagnostic] MongoDB lookup failed, falling back to hardcoded dictionary:",
      (error as Error).message,
    );
    return null;
  }
}

// ────────────────────────────────────────────
// Hardcoded Fallback Lookup
// ────────────────────────────────────────────

/**
 * Find an error code entry in the hardcoded dictionary.
 * Matches by exact code or case-insensitive partial match.
 */
function findInFallback(
  errorCode: string,
  provider?: string,
): ErrorCodeEntry | null {
  const normalizedCode = errorCode.trim().toUpperCase();

  // 1. Try exact match (with provider specificity)
  let match = ERROR_CODE_DICTIONARY.find((entry) => {
    const codeMatch = entry.code.toUpperCase() === normalizedCode;
    const providerMatch =
      !provider || entry.provider === "all" || entry.provider === provider;
    return codeMatch && providerMatch;
  });

  if (match) return match;

  // 2. Try partial match (e.g., user says "16" and entry is "E16")
  match = ERROR_CODE_DICTIONARY.find((entry) => {
    const codeMatch =
      entry.code.toUpperCase().includes(normalizedCode) ||
      normalizedCode.includes(entry.code.toUpperCase());
    return codeMatch;
  });

  return match || null;
}

// ────────────────────────────────────────────
// Select Fix Instructions
// ────────────────────────────────────────────

function selectFix(
  entry: ErrorCodeEntry,
  isSubscriptionActive: "true" | "false" | "unknown",
): string {
  switch (isSubscriptionActive) {
    case "true":
      return entry.fixIfActive;
    case "false":
      return entry.fixIfExpired;
    default:
      return entry.fixGeneric;
  }
}

// ────────────────────────────────────────────
// Main Diagnostic Function
// ────────────────────────────────────────────

/**
 * Diagnose a Pay TV error code and return fix instructions.
 *
 * Tries MongoDB first for the latest data, then falls back to
 * the hardcoded dictionary if the database is unavailable.
 *
 * @param errorCode - The error code from the decoder screen
 * @param isSubscriptionActive - "true", "false", or "unknown"
 * @param provider - Optional: "dstv", "gotv"
 */
export async function diagnoseError(
  errorCode: string,
  isSubscriptionActive: "true" | "false" | "unknown" = "unknown",
  provider?: string,
): Promise<DiagnosticResult> {
  // 1. Try MongoDB first
  const dbEntry = await findInDatabase(errorCode, provider);
  if (dbEntry) {
    return {
      errorCode: dbEntry.code,
      meaning: dbEntry.meaning,
      fixInstructions: selectFix(dbEntry, isSubscriptionActive),
      isAutomatable: dbEntry.isAutomatable,
      ussdCode: dbEntry.ussdCode,
      severity: dbEntry.severity,
      category: dbEntry.category,
      source: "database",
    };
  }

  // 2. Fall back to hardcoded dictionary
  const fallbackEntry = findInFallback(errorCode, provider);
  if (fallbackEntry) {
    return {
      errorCode: fallbackEntry.code,
      meaning: fallbackEntry.meaning,
      fixInstructions: selectFix(fallbackEntry, isSubscriptionActive),
      isAutomatable: fallbackEntry.isAutomatable,
      ussdCode: fallbackEntry.ussdCode,
      severity: fallbackEntry.severity,
      category: fallbackEntry.category,
      source: "fallback",
    };
  }

  // 3. Unknown error code
  return {
    errorCode,
    meaning: "Unknown error code",
    fixInstructions:
      "I don't recognize that error code in our database. " +
      "Can you please double-check the code on your screen and tell me again? " +
      "If you can describe what you see, I can try to help from there.",
    isAutomatable: false,
    ussdCode: null,
    severity: "medium",
    category: "unknown",
    source: "fallback",
  };
}
