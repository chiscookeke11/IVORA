import { WebSocket } from "ws";
import { buildSystemPrompt } from "../../src/lib/constants";
import { IVORA_TOOLS } from "../../src/lib/tools";

const OPENAI_REALTIME_URL = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview";

/**
 * Build the session configuration for the OpenAI Realtime API.
 *
 * This follows the format used in Twilio's official reference implementation:
 * https://github.com/twilio-samples/speech-assistant-openai-realtime-api-node
 */
function buildSessionConfig(): Record<string, unknown> {
  return {
    type: "session.update",
    session: {
      input_audio_format: "g711_ulaw",
      output_audio_format: "g711_ulaw",
      voice: "alloy",
      instructions: buildSystemPrompt(),
      modalities: ["text", "audio"],
      temperature: 0.7,
      input_audio_transcription: {
        model: "whisper-1",
      },
      turn_detection: {
        type: "server_vad",
        threshold: 0.3,
        prefix_padding_ms: 300,
        silence_duration_ms: 500,
      },
      tools: IVORA_TOOLS,
      tool_choice: "auto",
    },
  };
}

/**
 * Opens a WebSocket connection to the OpenAI Realtime API and sends
 * the initial session.update event to configure the session.
 *
 * The session config is sent after a 100ms delay (as per Twilio's
 * reference implementation) to ensure the connection is stable.
 *
 * @returns A promise that resolves to the connected OpenAI WebSocket.
 */
export function connectToOpenAI(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      reject(new Error("OPENAI_API_KEY is not set in environment variables."));
      return;
    }

    const ws = new WebSocket(OPENAI_REALTIME_URL, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "realtime=v1",
      },
    });

    ws.on("open", () => {
      console.log("[openai] Connected to OpenAI Realtime API.");

      // Wait 100ms before sending session config (Twilio reference pattern)
      setTimeout(() => {
        const sessionConfig = buildSessionConfig();
        ws.send(JSON.stringify(sessionConfig));
        console.log("[openai] Session configuration sent.");
        resolve(ws);
      }, 100);
    });

    ws.on("error", (error) => {
      console.error("[openai] WebSocket connection error:", error.message);
      reject(error);
    });
  });
}
