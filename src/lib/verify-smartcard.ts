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
 * - Returns 'not_found' if credentials are missing or IUC is invalid
 * - Returns 'unsupported' if the provider is not dstv or gotv
 */

export interface ClubKashVerifyResult {
  customerName: string;
  status: "found" | "not_found" | "unknown" | "unsupported";
}

type SupportedProvider = "dstv" | "gotv";

interface ClubKashAPIResponse {
  customer_name: string; // "Customer Customer" on success, "INVALID_SMARTCARDNO" on failure
  status: string;        // "00" = success, "100" = invalid
}

interface CacheEntry {
  data: ClubKashVerifyResult;
  cachedAt: number;
}


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


/**
 * Verify a Pay TV decoder/IUC number via ClubKash (Nellobyte Systems).
 *
 * Returns the customer's registered name and whether the decoder was found.
 * If the IUC cannot be verified, it returns 'not_found' so the AI can prompt the user to re-enter or clarify.
 *
 * @param smartcardNumber - The customer's IUC or smartcard number
 * @param serviceProvider - "dstv" | "gotv" | any other string
 */
export async function verifySmartcard(
  smartcardNumber: string,
  serviceProvider: string,
): Promise<ClubKashVerifyResult> {
  const provider = serviceProvider.toLowerCase();
  const cacheKey = `${provider}:${smartcardNumber}`;

  // Check cache first
  const cached = getCached(cacheKey);
  if (cached) {
    console.log(`[clubkash] Cache hit for ${cacheKey}:`, cached);
    return cached;
  }

  if (provider !== "dstv" && provider !== "gotv") {
    console.warn(`[clubkash] Unsupported provider requested: "${serviceProvider}"`);
    const result: ClubKashVerifyResult = { customerName: "Unknown", status: "unsupported" };
    return result;
  }

  const userId = process.env.CLUBKASH_USERID;
  const apiKey = process.env.CLUBKASH_API_KEY;

  // No credentials — cannot verify. Return not_found so the AI asks the user to clarify.
  if (!userId || !apiKey) {
    console.error(`[clubkash] ❌ No credentials configured. Cannot verify ${cacheKey}. Returning not_found.`);
    return { customerName: "Unknown", status: "not_found" };
  }

  const url = `https://www.nellobytesystems.com/APIVerifyCableTVV1.0.asp?UserID=${userId}&APIKey=${apiKey}&CableTV=${provider as SupportedProvider}&SmartCardNo=${smartcardNumber}`;

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

    // Full response log for debugging
    console.log(`[clubkash] Full API response for ${cacheKey} (${elapsed}ms):`, data);

    // "00" = success, anything else = failure
    if (data.status !== "00" || data.customer_name === "INVALID_SMARTCARDNO") {
      console.warn(`[clubkash] Invalid IUC for ${cacheKey} — status: ${data.status}, name: ${data.customer_name}`);
      const result: ClubKashVerifyResult = { customerName: "Unknown", status: "not_found" };
      setCache(cacheKey, result);
      return result;
    }

    const result: ClubKashVerifyResult = {
      customerName: data.customer_name,
      status: "found",
    };

    setCache(cacheKey, result);
    console.log(`[clubkash] ✅ Verified ${cacheKey}:`, result);

    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`[clubkash] ❌ API error for ${cacheKey}: ${message}`);

    // On API failure, return not_found — the AI will ask the user to re-enter or clarify
    return { customerName: "Unknown", status: "not_found" };
  }
}
