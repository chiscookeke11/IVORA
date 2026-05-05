/**
 * OpenAI Realtime API WebSocket event types.
 *
 * These define the JSON messages exchanged over the WebSocket connection
 * with the OpenAI Realtime API (gpt-4o-realtime-preview).
 *
 * @see https://platform.openai.com/docs/api-reference/realtime
 */

// ────────────────────────────────────────────
// Session Configuration
// ────────────────────────────────────────────

export type AudioFormat = "pcm16" | "g711_ulaw" | "g711_alaw";
export type Modality = "text" | "audio";
export type VoiceOption = "alloy" | "ash" | "ballad" | "coral" | "echo" | "sage" | "shimmer" | "verse";

export interface TurnDetectionConfig {
  type: "server_vad";
  threshold?: number;
  prefix_padding_ms?: number;
  silence_duration_ms?: number;
}

export interface InputAudioTranscriptionConfig {
  model: "whisper-1";
}

export interface ToolDefinition {
  type: "function";
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, {
      type: string;
      description?: string;
      enum?: string[];
    }>;
    required?: string[];
  };
}

export interface SessionConfig {
  modalities?: Modality[];
  instructions?: string;
  voice?: VoiceOption;
  input_audio_format?: AudioFormat;
  output_audio_format?: AudioFormat;
  input_audio_transcription?: InputAudioTranscriptionConfig | null;
  turn_detection?: TurnDetectionConfig | null;
  tools?: ToolDefinition[];
  tool_choice?: "auto" | "none" | "required" | string;
  temperature?: number;
  max_response_output_tokens?: number | "inf";
}

// ────────────────────────────────────────────
// Client → Server events (We send to OpenAI)
// ────────────────────────────────────────────

/** Configure the session (voice, tools, system prompt, etc.) */
export interface SessionUpdateEvent {
  type: "session.update";
  session: SessionConfig;
}

/** Append a chunk of audio to the input buffer. */
export interface InputAudioBufferAppendEvent {
  type: "input_audio_buffer.append";
  audio: string; // Base64-encoded audio
}

/** Commit the current audio buffer (manual turn detection). */
export interface InputAudioBufferCommitEvent {
  type: "input_audio_buffer.commit";
}

/** Clear the input audio buffer. */
export interface InputAudioBufferClearEvent {
  type: "input_audio_buffer.clear";
}

/** Add a conversation item (e.g., a tool result). */
export interface ConversationItemCreateEvent {
  type: "conversation.item.create";
  item: {
    type: "function_call_output";
    call_id: string;
    output: string; // JSON stringified tool result
  };
}

/** Truncate a previous assistant message (for barge-in). */
export interface ConversationItemTruncateEvent {
  type: "conversation.item.truncate";
  item_id: string;
  content_index: number;
  audio_end_ms: number;
}

/** Trigger the model to generate a response. */
export interface ResponseCreateEvent {
  type: "response.create";
  response?: {
    modalities?: Modality[];
    instructions?: string;
  };
}

/** Cancel an in-progress response (for barge-in). */
export interface ResponseCancelEvent {
  type: "response.cancel";
}

/** Union of all client-to-server events. */
export type OpenAIClientEvent =
  | SessionUpdateEvent
  | InputAudioBufferAppendEvent
  | InputAudioBufferCommitEvent
  | InputAudioBufferClearEvent
  | ConversationItemCreateEvent
  | ConversationItemTruncateEvent
  | ResponseCreateEvent
  | ResponseCancelEvent;

// ────────────────────────────────────────────
// Server → Client events (OpenAI sends to us)
// ────────────────────────────────────────────

/** Confirms session was created. */
export interface SessionCreatedEvent {
  type: "session.created";
  session: SessionConfig & { id: string };
}

/** Confirms session was updated. */
export interface SessionUpdatedEvent {
  type: "session.updated";
  session: SessionConfig & { id: string };
}

/** A chunk of audio from the AI's response. */
export interface ResponseAudioDeltaEvent {
  type: "response.audio.delta";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string; // Base64-encoded audio chunk
}

/** The AI's audio response is complete. */
export interface ResponseAudioDoneEvent {
  type: "response.audio.done";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
}

/** A chunk of the AI's audio transcript (what the AI said, as text). */
export interface ResponseAudioTranscriptDeltaEvent {
  type: "response.audio_transcript.delta";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string;
}

/** The AI's audio transcript is complete. */
export interface ResponseAudioTranscriptDoneEvent {
  type: "response.audio_transcript.done";
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  transcript: string;
}

/** A chunk of the user's transcribed speech. */
export interface InputAudioTranscriptionCompletedEvent {
  type: "conversation.item.input_audio_transcription.completed";
  item_id: string;
  content_index: number;
  transcript: string;
}

/** The AI wants to call a function — arguments are streaming. */
export interface ResponseFunctionCallArgumentsDeltaEvent {
  type: "response.function_call_arguments.delta";
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  delta: string;
}

/** The AI's function call arguments are complete. */
export interface ResponseFunctionCallArgumentsDoneEvent {
  type: "response.function_call_arguments.done";
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  name: string;
  arguments: string; // JSON string
}

/** The full response is complete (all outputs finished). */
export interface ResponseDoneEvent {
  type: "response.done";
  response: {
    id: string;
    status: "completed" | "cancelled" | "failed" | "incomplete";
    output: Array<{
      type: string;
      id: string;
      role?: string;
      content?: Array<{
        type: string;
        transcript?: string;
      }>;
      name?: string;
      call_id?: string;
      arguments?: string;
    }>;
  };
}

/** VAD detected user started speaking (barge-in signal). */
export interface InputAudioBufferSpeechStartedEvent {
  type: "input_audio_buffer.speech_started";
  audio_start_ms: number;
  item_id: string;
}

/** VAD detected user stopped speaking. */
export interface InputAudioBufferSpeechStoppedEvent {
  type: "input_audio_buffer.speech_stopped";
  audio_end_ms: number;
  item_id: string;
}

/** VAD automatically committed the audio buffer. */
export interface InputAudioBufferCommittedEvent {
  type: "input_audio_buffer.committed";
  previous_item_id: string;
  item_id: string;
}

/** Rate limit information. */
export interface RateLimitsUpdatedEvent {
  type: "rate_limits.updated";
  rate_limits: Array<{
    name: string;
    limit: number;
    remaining: number;
    reset_seconds: number;
  }>;
}

/** An error from the API. */
export interface OpenAIErrorEvent {
  type: "error";
  error: {
    type: string;
    code: string;
    message: string;
    param: string | null;
    event_id: string | null;
  };
}

/** Union of all server-to-client events we handle. */
export type OpenAIServerEvent =
  | SessionCreatedEvent
  | SessionUpdatedEvent
  | ResponseAudioDeltaEvent
  | ResponseAudioDoneEvent
  | ResponseAudioTranscriptDeltaEvent
  | ResponseAudioTranscriptDoneEvent
  | InputAudioTranscriptionCompletedEvent
  | ResponseFunctionCallArgumentsDeltaEvent
  | ResponseFunctionCallArgumentsDoneEvent
  | ResponseDoneEvent
  | InputAudioBufferSpeechStartedEvent
  | InputAudioBufferSpeechStoppedEvent
  | InputAudioBufferCommittedEvent
  | RateLimitsUpdatedEvent
  | OpenAIErrorEvent;
