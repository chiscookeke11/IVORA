/**
 * ClubKash (Nellobyte Systems) API Client — Read-Only Smartcard Verification
 *
 * Calls the Nellobyte /APIVerifyCableTVV1.0.asp endpoint to verify a customer's
 * Pay TV decoder number and retrieve their registered name.
 *
 * Supported providers: DStv, GOtv
 *
 * Features:
 * - In-memory cache with 60-second TTL
 * - Rate limiting enforced by caller (call-handler)
 * - Mock mode when CLUBKASH credentials are not set
 */

// ────────────────────────────────────────────
// Types
// ────────────────────────────────────────────

export interface ClubKashVerifyResult {
  customerName: string;
  status: "found" | "not_found" | "unknown";
}

type SupportedProvider = "dstv" | "gotv";

interface ClubKashAPIResponse {
  customer_name: string; // "Charles Somto" on success, "INVALID_SMARTCARDNO" on failure
  status: string;        // "00" = success, "100" = invalid
}

interface CacheEntry {
  data: ClubKashVerifyResult;
  cachedAt: number;
}

// ────────────────────────────────────────────
// Cache
// ────────────────────────────────────────────

const CACHE_TTL_MS = 60_000; // 60 seconds
const cache = new Map<string, CacheEntry>();

function getCached(key: string): ClubKashVerifyResult | null {
  const entry = cache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.cachedAt > CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }
  return entry.data;
}

function setCache(key: string, data: ClubKashVerifyResult): void {
  cache.set(key, { data, cachedAt: Date.now() });
}

// ────────────────────────────────────────────
// Mock Data (used when ClubKash credentials are not configured)
// ────────────────────────────────────────────

function getMockResponse(smartcardNumber: string): ClubKashVerifyResult {
  // Even last digit → found, odd → not found
  const lastDigit = parseInt(smartcardNumber.slice(-1), 10);
  const found = !isNaN(lastDigit) && lastDigit % 2 === 0;
  return found
    ? { customerName: "Chinedu Okoro", status: "found" }
    : { customerName: "Unknown", status: "not_found" };
}

// ────────────────────────────────────────────
// Main Verification Function
// ────────────────────────────────────────────

/**
 * Verify a Pay TV decoder/IUC number via ClubKash (Nellobyte Systems).
 *
 * Returns the customer's registered name and whether the decoder was found.
 * Falls back to mock data when ClubKash credentials are not configured.
 *
 * @param smartcardNumber - The customer's IUC or smartcard number
 * @param serviceProvider - "dstv" | "gotv"
 */
export async function verifySmartcard(
  smartcardNumber: string,
  serviceProvider: string,
): Promise<ClubKashVerifyResult> {
  const provider = serviceProvider.toLowerCase() as SupportedProvider;
  const cacheKey = `${provider}:${smartcardNumber}`;

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[clubkash] Cache hit for ${cacheKey}`);
    return cached;
  }

  const userId = process.env.CLUBKASH_USERID;
  const apiKey = process.env.CLUBKASH_API_KEY;

  // No credentials → mock mode
  if (!userId || !apiKey) {
    console.log(`[clubkash] No credentials configured. Using mock data for ${cacheKey}`);
    const mockResult = getMockResponse(smartcardNumber);
    setCache(cacheKey, mockResult);
    return mockResult;
  }

  if (provider !== "dstv" && provider !== "gotv") {
    console.warn(`[clubkash] Unsupported provider: ${serviceProvider}`);
    return { customerName: "Unknown", status: "unknown" };
  }

  const url = `https://www.nellobytesystems.com/APIVerifyCableTVV1.0.asp?UserID=${userId}&APIKey=${apiKey}&CableTV=${provider}&SmartCardNo=${smartcardNumber}`;

  console.log(`[clubkash] Verifying ${cacheKey}...`);

  try {
    const startMs = Date.now();
    const response = await fetch(url, {
      method: "GET",
      signal: AbortSignal.timeout(20_000), // 20-second timeout
    });

    const elapsed = Date.now() - startMs;

    if (!response.ok) {
      throw new Error(`ClubKash API returned HTTP ${response.status}: ${response.statusText}`);
    }

    const text = await response.text();
    let data: ClubKashAPIResponse;

    try {
      data = JSON.parse(text);
    } catch {
      throw new Error(`ClubKash returned non-JSON response: ${text.substring(0, 100)}`);
    }

    console.log(`[clubkash] Response for ${cacheKey} in ${elapsed}ms: status=${data.status}, name=${data.customer_name}`);

    // "00" = success, anything else = failure
    if (data.status !== "00" || data.customer_name === "INVALID_SMARTCARDNO") {
      console.warn(`[clubkash] Invalid IUC for ${cacheKey} (status: ${data.status})`);
      const result: ClubKashVerifyResult = { customerName: "Unknown", status: "not_found" };
      setCache(cacheKey, result);
      return result;
    }

    const result: ClubKashVerifyResult = {
      customerName: data.customer_name,
      status: "found",
    };

    setCache(cacheKey, result);
    console.log(`[clubkash] ✅ Verified ${cacheKey}: ${result.customerName}`);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[clubkash] ❌ API error for ${cacheKey}: ${message}`);

    // On API failure, return gracefully — do NOT crash the call
    return { customerName: "Unknown", status: "unknown" };
  }
}
