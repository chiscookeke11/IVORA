import { WebSocket, RawData } from "ws";
import { connectToOpenAI } from "../utils/openai-session";
import { handleDTMFDigit, DTMF_MENU_PROMPT } from "../utils/dtmf-handler";
import { verifySmartcard } from "../../src/lib/vtpass";
import { diagnoseError } from "../../src/lib/diagnostic-engine";
import { connectDB } from "../../src/lib/db";
import { CallSession } from "../../src/models/CallSession";
import { redirectToAgent } from "../../src/lib/twilio";
import type {
  TwilioInboundEvent,
  TwilioOutboundMedia,
  TwilioOutboundMark,
  TwilioOutboundClear,
} from "../../src/types/twilio";
import type {
  OpenAIServerEvent,
  InputAudioBufferAppendEvent,
  ConversationItemCreateEvent,
  ResponseCreateEvent,
  ResponseCancelEvent,
  ConversationItemTruncateEvent,
} from "../../src/types/openai-realtime";

// ────────────────────────────────────────────
// Constants
// ────────────────────────────────────────────

const MAX_VTPASS_CALLS = 3;
const DTMF_FALLBACK_THRESHOLD = 3;

// ────────────────────────────────────────────
// CallHandler — One instance per active call
// ────────────────────────────────────────────

export class CallHandler {
  // WebSocket connections
  private twilioWs: WebSocket;
  private openaiWs: WebSocket | null = null;

  // Twilio stream identifiers
  private callSid: string = "";
  private streamSid: string = "";

  // Call state
  private isDTMFFallback: boolean = false;
  private failedUnderstandAttempts: number = 0;
  private vtpassCallCount: number = 0;
  private isCleanedUp: boolean = false;
  private openaiRetries: number = 0;
  private static readonly MAX_OPENAI_RETRIES = 2;
  private isResponseActive: boolean = false; // true while OpenAI is generating audio
  private responseAudioDurationMs: number = 0; // tracks how long the current response audio is

  // Barge-in tracking
  private markQueue: string[] = [];
  private lastAssistantItemId: string = "";
  private responseAudioCount: number = 0;
  private lastBargeInTime: number = 0;
  private consecutiveBargeIns: number = 0;
  private audioChunksSentSinceLastMark: number = 0;

  // Audio pipeline counters (for debugging)
  private mediaChunksReceived: number = 0;
  private mediaChunksForwarded: number = 0;
  private mediaChunksDropped: number = 0;
  private audioChunksSentToTwilio: number = 0;
  private hasDetectedVoice: boolean = false;

  /** Minimum ms between barge-in events to prevent false triggers. */
  private static readonly BARGE_IN_COOLDOWN_MS = 500;
  /** If the user interrupts this many times in a row, something is wrong. */
  private static readonly MAX_CONSECUTIVE_BARGE_INS = 5;
  /** How long to wait for OpenAI WebSocket to connect before failing. */
  private static readonly OPENAI_CONNECT_TIMEOUT_MS = 10_000;

  // Transcript logging
  private transcriptLog: Array<{
    role: string;
    content: string;
    timestamp: Date;
    toolName?: string;
    toolArgs?: unknown;
    toolResult?: unknown;
  }> = [];

  // Callback to notify the server when this call ends
  private onCleanup: (() => void) | null;

  constructor(twilioWs: WebSocket, onCleanup?: () => void) {
    this.twilioWs = twilioWs;
    this.onCleanup = onCleanup ?? null;
  }

  /**
   * Initialize the handler: set up Twilio WebSocket listeners.
   * OpenAI connection is established lazily on the first `start` event.
   */
  init(): void {
    this.twilioWs.on("message", (data: RawData) => {
      this.handleTwilioMessage(data);
    });

    this.twilioWs.on("close", (code: number, reason: Buffer) => {
      console.log(`[call:${this.callSid}] Twilio WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`);
      this.cleanup();
    });

    this.twilioWs.on("error", (error: Error) => {
      console.error(`[call:${this.callSid}] Twilio WebSocket error:`, error.message);
      this.cleanup();
    });
  }

  // ──────────────────────────────────────────
  // Twilio → Server
  // ──────────────────────────────────────────

  private handleTwilioMessage(data: RawData): void {
    let event: TwilioInboundEvent;

    try {
      event = JSON.parse(data.toString());
    } catch {
      console.error(`[call:${this.callSid}] Failed to parse Twilio message.`);
      return;
    }

    switch (event.event) {
      case "connected":
        console.log(`[call] Twilio connected. Protocol: ${event.protocol}`);
        break;

      case "start":
        this.callSid = event.start.callSid;
        this.streamSid = event.streamSid;
        console.log(`[call:${this.callSid}] Stream started. StreamSid: ${this.streamSid}`);
        console.log(`[call:${this.callSid}] Stream details:`, JSON.stringify({
          tracks: event.start.tracks,
          mediaFormat: event.start.mediaFormat,
          accountSid: event.start.accountSid,
        }));
        
        // Capture custom parameters from TwiML
        const customParameters = event.start.customParameters || {};
        const shouldGreet = customParameters.greeting === "true";

        this.createCallSession();
        this.connectOpenAI(shouldGreet);
        break;

      case "media":
        this.mediaChunksReceived++;
        // Log every 100 chunks (~2 seconds of audio) to avoid flooding
        if (this.mediaChunksReceived % 100 === 1) {
          console.log(`[call:${this.callSid}] Audio chunks - Received: ${this.mediaChunksReceived}, Forwarded: ${this.mediaChunksForwarded}, Dropped: ${this.mediaChunksDropped}`);
        }
        this.forwardAudioToOpenAI(event.media.payload);
        break;

      case "dtmf":
        console.log(`[call:${this.callSid}] DTMF digit received: ${event.dtmf.digit}`);
        this.handleDTMFInput(event.dtmf.digit);
        break;

      case "mark":
        this.handleMark(event.mark.name);
        break;

      case "stop":
        console.log(`[call:${this.callSid}] Stream stopped.`);
        this.cleanup();
        break;

      default:
        console.log(`[call:${this.callSid}] Unknown Twilio event:`, (event as { event: string }).event);
    }
  }

  // ──────────────────────────────────────────
  // OpenAI Connection
  // ──────────────────────────────────────────

  private async connectOpenAI(shouldGreet: boolean = false): Promise<void> {
    console.log(`[call:${this.callSid}] Attempting to connect to OpenAI... (ShouldGreet: ${shouldGreet})`);
    try {
      // Race the connection against a timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(
          () => reject(new Error("OpenAI connection timed out")),
          CallHandler.OPENAI_CONNECT_TIMEOUT_MS,
        );
      });

      this.openaiWs = await Promise.race([connectToOpenAI(), timeoutPromise]);
      console.log(`[call:${this.callSid}] OpenAI connection established.`);
      this.setupOpenAIListeners();

      // If requested, trigger an automatic greeting from the AI
      if (shouldGreet) {
        this.triggerAIGreeting();
      }
    } catch (error) {
      console.error(`[call:${this.callSid}] Failed to connect to OpenAI:`, (error as Error).message);
      this.sendFallbackAndHangup("We are experiencing a technical issue. Please try again later.");
    }
  }

  /** Send a response.create event to OpenAI to force it to speak first. */
  private triggerAIGreeting(): void {
    if (!this.openaiWs || this.openaiWs.readyState !== WebSocket.OPEN) return;

    const responseEvent: ResponseCreateEvent = {
      type: "response.create",
      response: {
        modalities: ["text", "audio"],
        instructions: "Speak in English. Introduce yourself as Ivora, the Pay TV diagnostic assistant. Ask the customer how you can help them today. Keep it warm, friendly, and brief — no more than two sentences.",
      },
    };

    this.openaiWs.send(JSON.stringify(responseEvent));
    console.log(`[call:${this.callSid}] Triggered AI greeting.`);
  }

  private setupOpenAIListeners(): void {
    if (!this.openaiWs) return;

    this.openaiWs.on("message", (data: RawData) => {
      this.handleOpenAIMessage(data);
    });

    this.openaiWs.on("close", (code: number, reason: Buffer) => {
      console.log(`[call:${this.callSid}] OpenAI WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`);

      // If OpenAI drops unexpectedly while the call is still active, try to reconnect
      if (this.twilioWs.readyState === WebSocket.OPEN && !this.isCleanedUp) {
        if (this.openaiRetries < CallHandler.MAX_OPENAI_RETRIES) {
          this.openaiRetries++;
          console.log(`[call:${this.callSid}] Attempting OpenAI reconnect (retry ${this.openaiRetries}/${CallHandler.MAX_OPENAI_RETRIES})...`);
          this.connectOpenAI(true); // Re-greet after reconnect
        } else {
          console.log(`[call:${this.callSid}] Max OpenAI retries reached. Falling back.`);
          this.sendFallbackAndHangup("We are experiencing a temporary issue. Please try again shortly.");
        }
      }
    });

    this.openaiWs.on("error", (error: Error) => {
      console.error(`[call:${this.callSid}] OpenAI WebSocket error:`, error.message);
    });
  }

  // ──────────────────────────────────────────
  // OpenAI → Server
  // ──────────────────────────────────────────

  private handleOpenAIMessage(data: RawData): void {
    let event: any;

    try {
      event = JSON.parse(data.toString());
      // Log most events at trace level, but keep major ones visible
      const silentEvents = ["response.audio.delta", "response.output_audio.delta", "response.audio_transcript.delta"];
      if (!silentEvents.includes(event.type)) {
        console.log(`[call:${this.callSid}] OpenAI Event: ${event.type}`);
      }
    } catch {
      console.error(`[call:${this.callSid}] Failed to parse OpenAI message.`);
      return;
    }

    switch (event.type) {
      case "session.created":
        console.log(`[call:${this.callSid}] OpenAI session created: ${event.session.id}`);
        break;

      case "session.updated":
        console.log(`[call:${this.callSid}] OpenAI session updated.`);
        break;

      case "response.created":
        this.isResponseActive = true;
        this.responseAudioDurationMs = 0;
        break;

      // Handle both old and new API event names for audio delta
      case "response.audio.delta":
      case "response.output_audio.delta":
        this.forwardAudioToTwilio(event.delta);
        this.lastAssistantItemId = event.item_id;
        this.responseAudioCount++;
        this.audioChunksSentSinceLastMark++;
        // Each audio chunk is ~20ms of audio at 8kHz
        this.responseAudioDurationMs += 20;
        break;

      case "response.audio.done":
      case "response.output_audio.done":
        // Insert a mark after each complete audio response for barge-in tracking
        this.sendMarkToTwilio(`audio-done-${this.responseAudioCount}`);
        break;

      case "response.audio_transcript.delta":
        // Accumulate for logging (no action needed for audio)
        break;

      case "response.audio_transcript.done":
        console.log(`[call:${this.callSid}] AI said: "${event.transcript}"`);
        {
          const entry = { role: "assistant", content: event.transcript, timestamp: new Date() };
          this.transcriptLog.push(entry);
          this.persistTranscriptEntry(entry);
        }
        break;

      case "conversation.item.input_audio_transcription.completed":
        console.log(`[call:${this.callSid}] User said: "${event.transcript}"`);
        {
          const entry = { role: "user", content: event.transcript, timestamp: new Date() };
          this.transcriptLog.push(entry);
          this.persistTranscriptEntry(entry);
        }
        break;

      case "input_audio_buffer.speech_started":
        this.handleBargeIn(event.item_id, event.audio_start_ms);
        break;

      case "response.function_call_arguments.done":
        console.log(`[call:${this.callSid}] Tool call: ${event.name}(${event.arguments})`);
        this.handleToolCall(event.call_id, event.name, event.arguments);
        break;

      case "response.done":
        this.isResponseActive = false;
        if (event.response.status === "completed") {
          // AI finished speaking without interruption — reset barge-in counter
          this.resetBargeInCounter();
        } else if (event.response.status === "failed") {
          console.error(`[call:${this.callSid}] OpenAI response failed.`);
        }
        break;

      case "rate_limits.updated":
        // Log if approaching limits
        for (const limit of event.rate_limits) {
          if (limit.remaining < 5) {
            console.warn(`[call:${this.callSid}] Rate limit warning: ${limit.name} — ${limit.remaining} remaining.`);
          }
        }
        break;

      case "error":
        console.error(`[call:${this.callSid}] OpenAI error:`, event.error.message);
        break;

      default:
        // Silently ignore unhandled events (there are many)
        break;
    }
  }

  // ──────────────────────────────────────────
  // Audio Piping
  // ──────────────────────────────────────────

  /** Forward base64 audio from Twilio to OpenAI. */
  private forwardAudioToOpenAI(payload: string): void {
    if (!this.openaiWs || this.openaiWs.readyState !== WebSocket.OPEN) {
      this.mediaChunksDropped++;
      return;
    }

    const event: InputAudioBufferAppendEvent = {
      type: "input_audio_buffer.append",
      audio: payload,
    };

    this.openaiWs.send(JSON.stringify(event));
    this.mediaChunksForwarded++;

    // Log the first chunk for format verification
    if (this.mediaChunksForwarded === 1) {
      console.log(`[call:${this.callSid}] First audio chunk forwarded. Length: ${payload.length} chars, Preview: ${payload.substring(0, 20)}...`);
    }

    // Detect when non-silence audio first arrives (silence in µ-law is 0xFF = '/' in base64)
    if (!this.hasDetectedVoice && payload.replace(/\//g, '').length > 10) {
      this.hasDetectedVoice = true;
      console.log(`[call:${this.callSid}] 🎤 Non-silence audio detected at chunk #${this.mediaChunksForwarded}! Preview: ${payload.substring(0, 30)}`);
    }
  }

  /** Forward base64 audio from OpenAI to Twilio. */
  private forwardAudioToTwilio(payload: string): void {
    if (!this.streamSid || this.twilioWs.readyState !== WebSocket.OPEN) return;

    const message: TwilioOutboundMedia = {
      event: "media",
      streamSid: this.streamSid,
      media: { payload },
    };

    this.twilioWs.send(JSON.stringify(message));
    this.audioChunksSentToTwilio++;
  }

  // ──────────────────────────────────────────
  // Barge-In (Interruption Handling)
  // ──────────────────────────────────────────

  private handleBargeIn(itemId: string, audioStartMs: number): void {
    // Cooldown: ignore barge-ins that come too quickly after the last one
    const now = Date.now();
    if (now - this.lastBargeInTime < CallHandler.BARGE_IN_COOLDOWN_MS) {
      console.log(`[call:${this.callSid}] Barge-in ignored (cooldown, ${now - this.lastBargeInTime}ms since last).`);
      return;
    }
    this.lastBargeInTime = now;
    this.consecutiveBargeIns++;

    console.log(`[call:${this.callSid}] Barge-in #${this.consecutiveBargeIns} detected at ${audioStartMs}ms.`);

    // If the user keeps interrupting, it may indicate the AI isn't being understood
    if (this.consecutiveBargeIns >= CallHandler.MAX_CONSECUTIVE_BARGE_INS && !this.isDTMFFallback) {
      console.warn(`[call:${this.callSid}] Too many consecutive barge-ins. Switching to DTMF fallback.`);
      this.switchToDTMFFallback();
      return;
    }

    // 1. Only cancel if there's actually an active response in progress
    if (this.isResponseActive && this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      const cancelEvent: ResponseCancelEvent = { type: "response.cancel" };
      this.openaiWs.send(JSON.stringify(cancelEvent));

      // 2. Truncate only if we have a valid item and the timestamp is within the audio duration
      if (this.lastAssistantItemId && this.responseAudioDurationMs > 0) {
        // Cap the truncation point to the actual audio length to avoid the 'already shorter' error
        const safeTruncateMs = Math.min(audioStartMs, this.responseAudioDurationMs);
        const truncateEvent: ConversationItemTruncateEvent = {
          type: "conversation.item.truncate",
          item_id: this.lastAssistantItemId,
          content_index: 0,
          audio_end_ms: safeTruncateMs,
        };
        this.openaiWs.send(JSON.stringify(truncateEvent));
      }
    } else {
      console.log(`[call:${this.callSid}] Barge-in skipped cancel/truncate — no active response.`);
    }

    // 3. Clear Twilio's audio playback buffer
    if (this.twilioWs.readyState === WebSocket.OPEN) {
      const clearMessage: TwilioOutboundClear = {
        event: "clear",
        streamSid: this.streamSid,
      };
      this.twilioWs.send(JSON.stringify(clearMessage));
    }

    // Reset audio chunk counter since buffer was cleared
    this.audioChunksSentSinceLastMark = 0;
  }

  /** Reset the consecutive barge-in counter when the AI completes a response. */
  private resetBargeInCounter(): void {
    this.consecutiveBargeIns = 0;
  }

  private sendMarkToTwilio(name: string): void {
    if (this.twilioWs.readyState !== WebSocket.OPEN) return;

    const message: TwilioOutboundMark = {
      event: "mark",
      streamSid: this.streamSid,
      mark: { name },
    };
    this.twilioWs.send(JSON.stringify(message));
    this.markQueue.push(name);
    this.audioChunksSentSinceLastMark = 0;
  }

  private handleMark(name: string): void {
    const index = this.markQueue.indexOf(name);
    if (index !== -1) {
      // All marks up to this one have been played to the caller
      this.markQueue.splice(0, index + 1);
    }
  }

  // ──────────────────────────────────────────
  // Tool Execution
  // ──────────────────────────────────────────

  private async handleToolCall(callId: string, name: string, argsJson: string): Promise<void> {
    let result: unknown;
    const startTime = Date.now();

    try {
      const args = JSON.parse(argsJson);

      switch (name) {
        case "verify_smartcard":
          result = await this.executeVerifySmartcard(args);
          break;

        case "get_error_fix":
          result = await this.executeGetErrorFix(args);
          break;

        case "transfer_to_agent":
          result = await this.executeTransferToAgent(args);
          break;

        default:
          result = { error: `Unknown tool: ${name}` };
      }
    } catch (error) {
      result = { error: `Tool execution failed: ${(error as Error).message}` };
    }

    const durationMs = Date.now() - startTime;

    // Log the tool call
    this.transcriptLog.push({
      role: "tool",
      content: JSON.stringify(result),
      timestamp: new Date(),
      toolName: name,
      toolArgs: argsJson,
      toolResult: result,
    });

    console.log(`[call:${this.callSid}] Tool ${name} completed in ${durationMs}ms.`);

    // Persist to MongoDB (async, non-blocking)
    this.persistToolCall(name, argsJson, result, durationMs);

    // Send the result back to OpenAI
    this.sendToolResult(callId, result);
  }

  private sendToolResult(callId: string, result: unknown): void {
    if (!this.openaiWs || this.openaiWs.readyState !== WebSocket.OPEN) return;

    const itemEvent: ConversationItemCreateEvent = {
      type: "conversation.item.create",
      item: {
        type: "function_call_output",
        call_id: callId,
        output: JSON.stringify(result),
      },
    };

    const responseEvent: ResponseCreateEvent = {
      type: "response.create",
    };

    this.openaiWs.send(JSON.stringify(itemEvent));
    this.openaiWs.send(JSON.stringify(responseEvent));
  }

  // ──────────────────────────────────────────
  // Tool Implementations
  // ──────────────────────────────────────────

  private async executeVerifySmartcard(args: {
    smartcard_number: string;
    service_provider: string;
  }): Promise<unknown> {
    // Rate limit check
    if (this.vtpassCallCount >= MAX_VTPASS_CALLS) {
      return {
        error: "Verification limit reached for this session.",
        suggestion: "Please try the manual steps I mentioned earlier.",
      };
    }

    this.vtpassCallCount++;

    const result = await verifySmartcard(
      args.smartcard_number,
      args.service_provider,
    );

    return result;
  }

  private async executeGetErrorFix(args: {
    error_code: string;
    is_subscription_active?: string;
  }): Promise<unknown> {
    const subStatus = (args.is_subscription_active || "unknown") as
      | "true"
      | "false"
      | "unknown";

    const result = await diagnoseError(args.error_code, subStatus);
    return result;
  }

  private async executeTransferToAgent(args: { reason: string }): Promise<unknown> {
    console.log(`[call:${this.callSid}] Transfer requested. Reason: ${args.reason}`);
    
    try {
      await redirectToAgent(this.callSid, args.reason);
      return { transferred: true, reason: args.reason };
    } catch (error) {
      console.error(`[call:${this.callSid}] Transfer failed:`, (error as Error).message);
      return { 
        transferred: false, 
        error: "Failed to connect to agent. Please try calling back later." 
      };
    }
  }

  // ──────────────────────────────────────────
  // DTMF Fallback
  // ──────────────────────────────────────────

  private handleDTMFInput(digit: string): void {
    const action = handleDTMFDigit(digit);

    if (action.intent === "speak_to_agent") {
      this.executeTransferToAgent({ reason: "User requested via DTMF menu." });
      return;
    }

    // Send the spoken response back through OpenAI so it gets voiced
    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      const responseEvent: ResponseCreateEvent = {
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
          instructions: `Say exactly this to the user: "${action.spokenResponse}"`,
        },
      };
      this.openaiWs.send(JSON.stringify(responseEvent));
    }
  }

  /**
   * Switches to DTMF fallback mode after too many failed attempts.
   * This is called from the OpenAI response handler when we detect
   * the AI is struggling to understand the user.
   *
   * NOTE: In Phase 4, we'll add logic to detect failed understanding
   * from the AI's responses and increment failedUnderstandAttempts.
   */
  public switchToDTMFFallback(): void {
    if (this.isDTMFFallback) return;

    this.isDTMFFallback = true;
    console.log(`[call:${this.callSid}] Switching to DTMF fallback mode.`);

    // Ask OpenAI to speak the DTMF menu prompt
    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      const responseEvent: ResponseCreateEvent = {
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
          instructions: `Say exactly this to the user: "${DTMF_MENU_PROMPT}"`,
        },
      };
      this.openaiWs.send(JSON.stringify(responseEvent));
    }
  }

  // ──────────────────────────────────────────
  // Fallback & Cleanup
  // ──────────────────────────────────────────

  /**
   * Sends a spoken fallback message to the caller and ends the call.
   * Used when OpenAI connection fails or encounters a fatal error.
   */
  private sendFallbackAndHangup(message: string): void {
    // Use OpenAI to voice the message if still connected
    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      const responseEvent: ResponseCreateEvent = {
        type: "response.create",
        response: {
          modalities: ["text", "audio"],
          instructions: `Say exactly this to the user: "${message}" Then say goodbye.`,
        },
      };
      this.openaiWs.send(JSON.stringify(responseEvent));
    }

    // Log the call as failed
    console.log(`[call:${this.callSid}] Fallback triggered: "${message}"`);
  }

  /** Clean up all connections and resources. */
  private cleanup(): void {
    if (this.isCleanedUp) return; // Prevent double-cleanup
    this.isCleanedUp = true;

    console.log(`[call:${this.callSid}] Cleaning up. Transcript entries: ${this.transcriptLog.length}`);
    console.log(`[call:${this.callSid}] Audio pipeline summary:`);
    console.log(`  Twilio → Server: ${this.mediaChunksReceived} chunks received`);
    console.log(`  Server → OpenAI: ${this.mediaChunksForwarded} chunks forwarded, ${this.mediaChunksDropped} dropped`);
    console.log(`  OpenAI → Twilio: ${this.audioChunksSentToTwilio} chunks sent`);

    if (this.openaiWs && this.openaiWs.readyState === WebSocket.OPEN) {
      this.openaiWs.close();
    }

    // Clear state
    this.markQueue = [];

    // Finalize the session in MongoDB (async, non-blocking)
    this.finalizeCallSession();

    // Notify the server that this call has ended
    this.onCleanup?.();
  }

  /**
   * Force-close this call handler. Called by the server during
   * graceful shutdown (SIGTERM/SIGINT).
   */
  public forceClose(): void {
    console.log(`[call:${this.callSid}] Force closing (server shutdown).`);

    if (this.twilioWs.readyState === WebSocket.OPEN) {
      this.twilioWs.close();
    }

    this.cleanup();
  }

  // ──────────────────────────────────────────
  // MongoDB Persistence (async, fire-and-forget)
  //
  // DB writes NEVER block the audio stream.
  // If a write fails, the call continues and the error is logged.
  // ──────────────────────────────────────────

  /** Create the initial CallSession document when the call starts. */
  private async createCallSession(): Promise<void> {
    try {
      await connectDB();
      await CallSession.create({
        callSid: this.callSid,
        streamSid: this.streamSid,
        status: "active",
        startedAt: new Date(),
      });
      console.log(`[call:${this.callSid}] CallSession created in MongoDB.`);
    } catch (error) {
      console.error(`[call:${this.callSid}] Failed to create CallSession:`, (error as Error).message);
    }
  }

  /** Push a transcript entry to the CallSession. */
  private async persistTranscriptEntry(entry: {
    role: string;
    content: string;
    timestamp: Date;
    toolName?: string;
    toolArgs?: unknown;
    toolResult?: unknown;
  }): Promise<void> {
    try {
      await CallSession.updateOne(
        { callSid: this.callSid },
        { $push: { transcript: entry } },
      );
    } catch (error) {
      console.error(`[call:${this.callSid}] Failed to persist transcript:`, (error as Error).message);
    }
  }

  /** Push a tool call record to the CallSession. */
  private async persistToolCall(
    name: string,
    args: unknown,
    result: unknown,
    durationMs: number,
  ): Promise<void> {
    try {
      const updateFields: Record<string, unknown> = {};

      // Update diagnostic context based on tool results
      if (name === "verify_smartcard" && result && typeof result === "object") {
        const r = result as Record<string, unknown>;
        if (r.customerName) updateFields.customerName = r.customerName;
        if (r.currentPlan) updateFields.detectedProvider = this.inferProvider(r.currentPlan as string);
        if (r.status) updateFields.subscriptionStatus = r.status;
        if (r.dueDate) updateFields.subscriptionDueDate = new Date(r.dueDate as string);
      }

      if (name === "get_error_fix" && args && typeof args === "object") {
        const a = args as Record<string, unknown>;
        if (a.error_code) updateFields.detectedErrorCode = a.error_code;
      }

      if (name === "transfer_to_agent" && args && typeof args === "object") {
        const a = args as Record<string, unknown>;
        if (a.reason) updateFields.transferReason = a.reason;
      }

      await CallSession.updateOne(
        { callSid: this.callSid },
        {
          $push: {
            toolCalls: { name, args, result, calledAt: new Date(), durationMs },
          },
          $set: {
            vtpassCallCount: this.vtpassCallCount,
            ...updateFields,
          },
        },
      );
    } catch (error) {
      console.error(`[call:${this.callSid}] Failed to persist tool call:`, (error as Error).message);
    }
  }

  /** Infer provider from plan name (best-effort). */
  private inferProvider(planName: string): string | null {
    const lower = planName.toLowerCase();
    if (lower.includes("dstv")) return "dstv";
    if (lower.includes("gotv")) return "gotv";
    if (lower.includes("startimes") || lower.includes("star times")) return "startimes";
    return null;
  }

  /** Finalize the CallSession when the call ends. */
  private async finalizeCallSession(): Promise<void> {
    try {
      const now = new Date();

      // Determine outcome
      let outcome: string = "dropped";
      const lastToolCall = this.transcriptLog
        .filter((e) => e.role === "tool")
        .pop();

      if (lastToolCall?.toolName === "transfer_to_agent") {
        outcome = "escalated_to_agent";
      } else if (this.isDTMFFallback) {
        outcome = "dtmf_fallback";
      } else if (this.transcriptLog.length > 2) {
        // If we had a meaningful conversation, assume resolved
        outcome = "resolved";
      }

      await CallSession.updateOne(
        { callSid: this.callSid },
        {
          $set: {
            status: "completed",
            outcome,
            endedAt: now,
            usedDTMFFallback: this.isDTMFFallback,
            vtpassCallCount: this.vtpassCallCount,
            // Persist any remaining transcript entries that weren't pushed individually
            transcript: this.transcriptLog,
          },
        },
      );

      console.log(`[call:${this.callSid}] CallSession finalized. Outcome: ${outcome}`);
    } catch (error) {
      console.error(`[call:${this.callSid}] Failed to finalize CallSession:`, (error as Error).message);
    }
  }

  // ──────────────────────────────────────────
  // Getters (for dashboard / monitoring)
  // ──────────────────────────────────────────

  get sessionData() {
    return {
      callSid: this.callSid,
      streamSid: this.streamSid,
      isDTMFFallback: this.isDTMFFallback,
      vtpassCallCount: this.vtpassCallCount,
      transcriptLog: this.transcriptLog,
    };
  }
}
