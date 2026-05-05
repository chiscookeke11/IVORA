/**
 * Twilio Media Stream WebSocket event types.
 *
 * When Twilio opens a bidirectional media stream via <Connect><Stream>,
 * it sends JSON messages over the WebSocket with these shapes.
 *
 * @see https://www.twilio.com/docs/voice/media-streams/websocket-messages
 */

// ────────────────────────────────────────────
// Inbound events (Twilio → Our Server)
// ────────────────────────────────────────────

/** Sent once when the WebSocket connection is first established. */
export interface TwilioConnectedEvent {
  event: "connected";
  protocol: string;
  version: string;
}

/** Sent once after `connected`, contains metadata about the stream. */
export interface TwilioStartEvent {
  event: "start";
  sequenceNumber: string;
  start: {
    streamSid: string;
    accountSid: string;
    callSid: string;
    tracks: string[];
    customParameters: Record<string, string>;
    mediaFormat: {
      encoding: string; // "audio/x-mulaw"
      sampleRate: number; // 8000
      channels: number; // 1
    };
  };
  streamSid: string;
}

/** Sent continuously during the call — contains a chunk of audio data. */
export interface TwilioMediaEvent {
  event: "media";
  sequenceNumber: string;
  media: {
    track: "inbound" | "outbound";
    chunk: string;
    timestamp: string;
    payload: string; // Base64-encoded audio (g711_ulaw)
  };
  streamSid: string;
}

/** Sent when the caller hangs up or the stream is closed. */
export interface TwilioStopEvent {
  event: "stop";
  sequenceNumber: string;
  stop: {
    accountSid: string;
    callSid: string;
  };
  streamSid: string;
}

/** Sent when a previously sent `mark` message has been played to the caller. */
export interface TwilioMarkEvent {
  event: "mark";
  sequenceNumber: string;
  mark: {
    name: string;
  };
  streamSid: string;
}

/** Sent when the caller presses a key on their phone keypad. */
export interface TwilioDTMFEvent {
  event: "dtmf";
  sequenceNumber: string;
  dtmf: {
    track: "inbound_track";
    digit: string; // "0"-"9", "*", "#"
  };
  streamSid: string;
}

/** Union of all possible inbound Twilio WebSocket events. */
export type TwilioInboundEvent =
  | TwilioConnectedEvent
  | TwilioStartEvent
  | TwilioMediaEvent
  | TwilioStopEvent
  | TwilioMarkEvent
  | TwilioDTMFEvent;

// ────────────────────────────────────────────
// Outbound messages (Our Server → Twilio)
// ────────────────────────────────────────────

/** Send audio back to the caller. */
export interface TwilioOutboundMedia {
  event: "media";
  streamSid: string;
  media: {
    payload: string; // Base64-encoded audio (g711_ulaw)
  };
}

/** Insert a named marker into the audio playback queue. */
export interface TwilioOutboundMark {
  event: "mark";
  streamSid: string;
  mark: {
    name: string;
  };
}

/** Clear all queued audio that hasn't been played yet. */
export interface TwilioOutboundClear {
  event: "clear";
  streamSid: string;
}

/** Union of all outbound messages we can send to Twilio. */
export type TwilioOutboundMessage =
  | TwilioOutboundMedia
  | TwilioOutboundMark
  | TwilioOutboundClear;
