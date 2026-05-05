/**
 * ErrorCode Model
 *
 * Stores the Pay TV error code dictionary in MongoDB so it can be
 * updated via the dashboard without redeploying the application.
 *
 * The hardcoded dictionary in constants.ts serves as a fallback
 * when MongoDB is unavailable.
 */

import mongoose, { Schema, Document, Model } from "mongoose";

// ────────────────────────────────────────────
// Document Interface
// ────────────────────────────────────────────

export interface IErrorCode extends Document {
  code: string;
  provider: "dstv" | "gotv" | "startimes" | "all";
  meaning: string;
  fixIfActive: string;
  fixIfExpired: string;
  fixGeneric: string;
  isAutomatable: boolean;
  ussdCode: string | null;
  severity: "low" | "medium" | "high" | "critical";
  category: "subscription" | "signal" | "hardware" | "software";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ────────────────────────────────────────────
// Schema
// ────────────────────────────────────────────

const ErrorCodeSchema = new Schema<IErrorCode>(
  {
    code: { type: String, required: true },
    provider: {
      type: String,
      enum: ["dstv", "gotv", "startimes", "all"],
      required: true,
    },
    meaning: { type: String, required: true },
    fixIfActive: { type: String, required: true },
    fixIfExpired: { type: String, required: true },
    fixGeneric: { type: String, required: true },
    isAutomatable: { type: Boolean, default: false },
    ussdCode: { type: String, default: null },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    category: {
      type: String,
      enum: ["subscription", "signal", "hardware", "software"],
      required: true,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },
  },
  {
    timestamps: true, // Auto-manages createdAt & updatedAt
  },
);

// Compound unique index: same code + provider cannot exist twice
ErrorCodeSchema.index({ code: 1, provider: 1 }, { unique: true });

export const ErrorCode: Model<IErrorCode> =
  mongoose.models.ErrorCode ||
  mongoose.model<IErrorCode>("ErrorCode", ErrorCodeSchema);
