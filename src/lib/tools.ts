/**
 * OpenAI Realtime API Tool (Function) Definitions
 *
 * These are the tools exposed to the AI during a call session.
 * The AI can invoke them via function calling to look up customer data
 * and retrieve fix instructions.
 */

import type { ToolDefinition } from "@/types/openai-realtime";

/** Looks up a Pay TV customer's registered name using their IUC number via ClubKash. */
const verifySmartcard: ToolDefinition = {
  type: "function",
  name: "verify_smartcard",
  description:
    "Verifies a Pay TV customer's IUC or smartcard number and retrieves the name registered to that decoder. " +
    "Use this as soon as the customer provides their IUC or smartcard number to confirm it is valid " +
    "and to address the customer by their real name during the call.",
  parameters: {
    type: "object",
    properties: {
      smartcard_number: {
        type: "string",
        description:
          "The customer's IUC or smartcard number. Usually 10 digits for DStv/GOtv.",
      },
      service_provider: {
        type: "string",
        description: "The Pay TV service provider. Only DStv and GOtv are supported.",
        enum: ["dstv", "gotv"],
      },
    },
    required: ["smartcard_number", "service_provider"],
  },
};

/** Retrieves the fix instructions for a specific error code. */
const getErrorFix: ToolDefinition = {
  type: "function",
  name: "get_error_fix",
  description:
    "Retrieves detailed step-by-step fix instructions for a specific Pay TV error code. " +
    "The instructions vary depending on whether the customer's subscription is currently active or expired. " +
    "Use this after identifying the error code the customer is seeing on their screen.",
  parameters: {
    type: "object",
    properties: {
      error_code: {
        type: "string",
        description:
          'The error code displayed on the decoder screen. Examples: "E16", "E48-32", "No Signal".',
      },
      is_subscription_active: {
        type: "string",
        description:
          'Whether the customer\'s subscription is currently active. Use "true", "false", or "unknown" if not yet verified.',
        enum: ["true", "false", "unknown"],
      },
    },
    required: ["error_code"],
  },
};

/** Escalates the call to a human agent. */
const transferToAgent: ToolDefinition = {
  type: "function",
  name: "transfer_to_agent",
  description:
    "Transfers the call to a human support agent. Use this ONLY when: " +
    "(1) You have exhausted all troubleshooting steps and cannot resolve the issue, or " +
    "(2) The customer explicitly and repeatedly asks to speak with a human. " +
    "Always try to resolve the issue yourself first.",
  parameters: {
    type: "object",
    properties: {
      reason: {
        type: "string",
        description:
          "A brief explanation of why the call is being transferred, including what was already tried.",
      },
    },
    required: ["reason"],
  },
};

/** All tools available to the AI during a call session. */
export const IVORA_TOOLS: ToolDefinition[] = [
  verifySmartcard,
  getErrorFix,
  transferToAgent,
];
