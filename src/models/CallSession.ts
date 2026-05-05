/**
 * CallSession Model
 *
 * The core document — one per phone call. Tracks the entire lifecycle
 * from start to end, including transcript, tool calls, and diagnostic context.
 *
 * Identity is derived from Twilio's `callSid` (no user auth needed).
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ────────────────────────────────────────────
// Subdocument Interfaces
// ────────────────────────────────────────────

export interface ITranscriptEntry {
  role: "user" | "assistant" | "system" | "tool";
  content: string;
  timestamp: Date;
  toolName?: string;
  toolArgs?: Record<string, unknown>;
  toolResult?: Record<string, unknown>;
}

export interface IToolCall {
  name: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
  calledAt: Date;
  durationMs: number;
}

// ────────────────────────────────────────────
// Document Interface
// ────────────────────────────────────────────

export interface ICallSession extends Document {
  callSid: string;
  streamSid: string;
  callerNumber: string;
  region: "NG" | "EU" | "unknown";
  status: "active" | "completed" | "failed";
  outcome: "resolved" | "escalated_to_agent" | "dtmf_fallback" | "dropped" | null;

  // Diagnostic context
  detectedProvider: "dstv" | "gotv" | "startimes" | null;
  detectedErrorCode: string | null;
  smartcardNumber: string | null;
  customerName: string | null;
  subscriptionStatus: "active" | "expired" | null;
  subscriptionDueDate: Date | null;

  // Conversation data
  transcript: ITranscriptEntry[];
  toolCalls: IToolCall[];

  // Metadata
  usedDTMFFallback: boolean;
  vtpassCallCount: number;
  transferReason: string | null;

  // Timestamps
  startedAt: Date;
  endedAt: Date | null;
  durationMs: number | null;
}

// ────────────────────────────────────────────
// Subdocument Schemas
// ────────────────────────────────────────────

const TranscriptEntrySchema = new Schema<ITranscriptEntry>(
  {
    role: {
      type: String,
      enum: ["user", "assistant", "system", "tool"],
      required: true,
    },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    toolName: { type: String },
    toolArgs: { type: Schema.Types.Mixed },
    toolResult: { type: Schema.Types.Mixed },
  },
  { _id: false },
);

const ToolCallSchema = new Schema<IToolCall>(
  {
    name: { type: String, required: true },
    args: { type: Schema.Types.Mixed, default: {} },
    result: { type: Schema.Types.Mixed, default: {} },
    calledAt: { type: Date, default: Date.now },
    durationMs: { type: Number, default: 0 },
  },
  { _id: false },
);

// ────────────────────────────────────────────
// Main Schema
// ────────────────────────────────────────────

const CallSessionSchema = new Schema<ICallSession>(
  {
    callSid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    streamSid: { type: String, default: "" },
    callerNumber: { type: String, default: "" },
    region: {
      type: String,
      enum: ["NG", "EU", "unknown"],
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["active", "completed", "failed"],
      default: "active",
      index: true,
    },
    outcome: {
      type: String,
      enum: ["resolved", "escalated_to_agent", "dtmf_fallback", "dropped", null],
      default: null,
    },

    // Diagnostic context
    detectedProvider: {
      type: String,
      enum: ["dstv", "gotv", "startimes", null],
      default: null,
    },
    detectedErrorCode: { type: String, default: null, index: true },
    smartcardNumber: { type: String, default: null },
    customerName: { type: String, default: null },
    subscriptionStatus: {
      type: String,
      enum: ["active", "expired", null],
      default: null,
    },
    subscriptionDueDate: { type: Date, default: null },

    // Conversation data (embedded)
    transcript: { type: [TranscriptEntrySchema], default: [] },
    toolCalls: { type: [ToolCallSchema], default: [] },

    // Metadata
    usedDTMFFallback: { type: Boolean, default: false },
    vtpassCallCount: { type: Number, default: 0 },
    transferReason: { type: String, default: null },

    // Timestamps
    startedAt: { type: Date, default: Date.now, index: true },
    endedAt: { type: Date, default: null },
    durationMs: { type: Number, default: null },
  },
  {
    timestamps: false, // We manage startedAt/endedAt manually
  },
);

export const CallSession: Model<ICallSession> =
  mongoose.models.CallSession ||
  mongoose.model<ICallSession>("CallSession", CallSessionSchema);
