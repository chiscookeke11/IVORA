"use server";

import { connectDB } from "@/lib/db";
import { CallSession } from "@/models/CallSession";
import { ErrorCode } from "@/models/ErrorCode";

/**
 * Formats a phone number by masking the middle digits and enforcing a +44 prefix.
 */
function maskPhoneNumber(number: string): string {
  if (!number) return "+44 **** ****";
  // Strip non-digits and ensure +44 (or replace whatever prefix exists)
  const digits = number.replace(/\D/g, "");
  const last2 = digits.slice(-2);
  const first3 = digits.slice(0, 3);
  return `+44 ${first3} **-**${last2}`;
}

/**
 * Formats a Date object into a readable time string (HH:mm AM/PM).
 */
function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * Calculates duration between two dates in MM:SS format.
 * If endedAt is missing, it calculates duration up to now.
 */
function calculateTotalDuration(startedAt: Date, endedAt: Date | null): string {
  const start = new Date(startedAt).getTime();
  const end = endedAt ? new Date(endedAt).getTime() : Date.now();
  const diffMs = end - start;
  const totalSeconds = Math.max(0, Math.floor(diffMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Fetches summary statistics for the admin dashboard summary cards.
 * Returns only the counts needed, with 'dropped' renamed to 'ended' for the frontend.
 * 
 * @returns Promise<{ active: number, resolved: number, escalated: number, ended: number }>
 */
export async function getDashboardStats() {
  await connectDB();

  const [active, resolved, escalated, dropped] = await Promise.all([
    CallSession.countDocuments({ status: "active" }),
    CallSession.countDocuments({ outcome: "resolved" }),
    CallSession.countDocuments({ outcome: "escalated_to_agent" }),
    CallSession.countDocuments({ outcome: "dropped" }),
  ]);

  const stats = { active, resolved, escalated, ended: dropped };
  console.log("[Action: getDashboardStats] Returning formatted stats:", stats);
  return stats;
}

/**
 * Fetches and formats active calls for the ActiveCallsHistory component.
 * Returns only { id, caller, duration }.
 */
export async function getActiveCalls() {
  await connectDB();

  const calls = await CallSession.find({ status: "active" })
    .sort({ startedAt: -1 })
    .lean();

  const formattedCalls = calls.map((call) => ({
    id: call._id.toString(),
    caller: maskPhoneNumber(call.callerNumber),
    duration: calculateTotalDuration(call.startedAt, null),
  }));

  console.log("[Action: getActiveCalls] Returning formatted active calls:", formattedCalls);
  return formattedCalls;
}

/**
 * Fetches and formats recent calls for the dashboard history table.
 * Returns only { id, time, caller, provider, error, outcome }.
 */
export async function getRecentCalls(limit: number = 5) {
  await connectDB();

  const outcomeMap: Record<string, string> = {
    resolved: "Resolved",
    escalated_to_agent: "Escalated",
    dtmf_fallback: "Ended",
    dropped: "Ended",
  };

  const calls = await CallSession.find()
    .sort({ startedAt: -1 })
    .limit(limit)
    .lean();
  console.log("All calls", calls)

  const formattedCalls = calls.map((call) => ({
    id: call._id.toString(),
    time: formatTime(call.startedAt),
    caller: maskPhoneNumber(call.callerNumber),
    provider: "Twilio",
    duration: calculateTotalDuration(call.startedAt, call.endedAt),
    outcome: call.outcome ? (outcomeMap[call.outcome] || call.outcome) : "Pending",
  }));

  console.log("[Action: getRecentCalls] Returning formatted recent calls:", formattedCalls);
  return formattedCalls;
}

/**
 * Aggregates top error codes from call sessions for the frequency chart.
 * Filters out null error codes and groups by the code string.
 * 
 * @returns Promise<{ labels: string[], data: number[] }>
 */
export async function getTopErrors() {
  await connectDB();

  const topErrors = await CallSession.aggregate([
    { $match: { detectedErrorCode: { $ne: null } } },
    { $group: { _id: "$detectedErrorCode", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 6 },
  ]);

  const result = {
    labels: topErrors.map((e) => e._id),
    data: topErrors.map((e) => e.count),
  };

  console.log("[Action: getTopErrors] Aggregated error data:", result);
  return result;
}

/**
 * Retrieves and formats the full list of error code definitions from the database.
 * Returns only { id, code, provider, meaning, category, severity }.
 */
export async function getAllErrorCodes() {
  await connectDB();

  const errorCodes = await ErrorCode.find().sort({ code: 1 }).lean();

  const formattedCodes = errorCodes.map((ec) => ({
    id: ec._id.toString(),
    code: ec.code,
    provider: ec.provider === "all" ? "All" : ec.provider.toUpperCase(),
    meaning: ec.meaning,
    category: ec.category.charAt(0).toUpperCase() + ec.category.slice(1),
    severity: ec.severity.charAt(0).toUpperCase() + ec.severity.slice(1),
  }));

  console.log("[Action: getAllErrorCodes] Returning formatted error codes:", formattedCodes);
  return formattedCodes;
}
