/**
 * VTpass API Client — Read-Only Smartcard Verification
 *
 * Calls VTpass's /api/merchant-verify endpoint to check a customer's
 * Pay TV subscription status. No payments are made — this is read-only.
 *
 * Features:
 * - In-memory cache with 60-second TTL
 * - Rate limiting (max calls enforced by caller)
 * - Mock mode when VTPASS_API_KEY is not set
 */

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface VTpassVerifyResult {
  customerName: string;
  currentPlan: string;
  dueDate: string;
  status: "active" | "expired" | "unknown";
}

interface VTpassAPIResponse {
  code: string;
  content: {
    Customer_Name: string;
    Status: string;
    DUE_DATE: string;
    Current_Bouquet: string;
    Current_Bouquet_Code: string;
    [key: string]: unknown;
  };
}

interface CacheEntry {
  data: VTpassVerifyResult;
  cachedAt: number;
}

// ────────────────────────────────────────────
// Cache
// ────────────────────────────────────────────

const CACHE_TTL_MS = 60_000; // 60 seconds
const cache = new Map<string, CacheEntry>();

function getCached(key: string): VTpassVerifyResult | null {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return entry.data;
}

function setCache(key: string, data: VTpassVerifyResult): void {
  cache.set(key, { data, cachedAt: Date.now() });
}

// ────────────────────────────────────────────
// Service ID mapping
// ────────────────────────────────────────────

const SERVICE_ID_MAP: Record<string, string> = {
  dstv: "dstv",
  gotv: "gotv",
  startimes: "startimes",
};

// ────────────────────────────────────────────
// Mock Data (used when VTpass credentials are not configured)
// ────────────────────────────────────────────

const MOCK_RESPONSES: Record<string, VTpassVerifyResult> = {
  default_active: {
    customerName: "Chinedu Okoro",
    currentPlan: "DStv Compact Plus",
    dueDate: "2026-06-01",
    status: "active",
  },
  default_expired: {
    customerName: "Amina Ibrahim",
    currentPlan: "GOtv Max",
    dueDate: "2026-04-15",
    status: "expired",
  },
};

function getMockResponse(
  smartcardNumber: string,
): VTpassVerifyResult {
  // Smartcard numbers ending in even digits → active, odd → expired
  const lastDigit = parseInt(smartcardNumber.slice(-1), 10);
  const isActive = !isNaN(lastDigit) && lastDigit % 2 === 0;

  const base = isActive
    ? MOCK_RESPONSES.default_active
    : MOCK_RESPONSES.default_expired;

  return {
    ...base,
    // Slightly randomize to make testing more realistic
    customerName: isActive ? "Chinedu Okoro" : "Amina Ibrahim",
    dueDate: isActive ? "2026-06-01" : "2026-04-15",
  };
}

// ────────────────────────────────────────────
// Main Verification Function
// ────────────────────────────────────────────

/**
 * Verify a Pay TV smartcard/IUC number via VTpass.
 *
 * Returns the customer's name, current plan, due date, and status.
 * Falls back to mock data when VTpass credentials are not configured.
 *
 * @param smartcardNumber - The customer's IUC or smartcard number
 * @param serviceProvider - "dstv" | "gotv" | "startimes"
 */
export async function verifySmartcard(
  smartcardNumber: string,
  serviceProvider: string,
): Promise<VTpassVerifyResult> {
  const cacheKey = `${serviceProvider}:${smartcardNumber}`;

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[vtpass] Cache hit for ${cacheKey}`);
    return cached;
  }

  const apiKey = process.env.VTPASS_API_KEY;
  const secretKey = process.env.VTPASS_SECRET_KEY;
  const baseUrl = process.env.VTPASS_BASE_URL || "https://sandbox.vtpass.com";

  // If no credentials, use mock data
  if (!apiKey || !secretKey) {
    console.log(`[vtpass] No credentials configured. Using mock data for ${cacheKey}`);
    const mockResult = getMockResponse(smartcardNumber);
    setCache(cacheKey, mockResult);
    return mockResult;
  }

  // Real VTpass API call
  const serviceID = SERVICE_ID_MAP[serviceProvider];
  if (!serviceID) {
    throw new Error(`Unknown service provider: ${serviceProvider}`);
  }

  try {
    const response = await fetch(`${baseUrl}/api/merchant-verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
        "secret-key": secretKey,
      },
      body: JSON.stringify({
        billersCode: smartcardNumber,
        serviceID,
      }),
      signal: AbortSignal.timeout(10_000), // 10-second timeout
    });

    if (!response.ok) {
      throw new Error(`VTpass API returned ${response.status}: ${response.statusText}`);
    }

    const data: VTpassAPIResponse = await response.json();

    if (data.code !== "000") {
      // VTpass returns non-000 codes for invalid smartcards, etc.
      console.warn(`[vtpass] API returned code ${data.code} for ${cacheKey}`);
      return {
        customerName: "Unknown",
        currentPlan: "Unknown",
        dueDate: "Unknown",
        status: "unknown",
      };
    }

    const now = new Date();
    const dueDate = new Date(data.content.DUE_DATE);
    const isActive = dueDate > now;

    const result: VTpassVerifyResult = {
      customerName: data.content.Customer_Name || "Unknown",
      currentPlan: data.content.Current_Bouquet || "Unknown",
      dueDate: data.content.DUE_DATE || "Unknown",
      status: isActive ? "active" : "expired",
    };

    setCache(cacheKey, result);
    console.log(`[vtpass] Verified ${cacheKey}: ${result.customerName} — ${result.status}`);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[vtpass] API error for ${cacheKey}: ${message}`);

    // On API failure, return a graceful unknown status rather than crashing the call
    return {
      customerName: "Unknown",
      currentPlan: "Unknown",
      dueDate: "Unknown",
      status: "unknown",
    };
  }
}
