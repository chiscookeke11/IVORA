import { NextResponse } from "next/server";

/**
 * Twilio Incoming Call Webhook
 *
 * When a customer dials the Twilio phone number, Twilio sends a POST request
 * to this route. We respond with TwiML (XML) that:
 *
 * 1. Speaks a brief welcome greeting.
 * 2. Opens a bidirectional WebSocket stream (<Connect><Stream>) to our
 *    standalone WS server, which bridges the audio to OpenAI Realtime API.
 *
 * The <Stream> URL must point to the standalone WebSocket server
 * (either ngrok URL in dev or the deployed Railway/Render URL in prod).
 */
export async function POST() {
  let wsUrl = process.env.PUBLIC_WS_URL;
  
  // Clean up URL (remove quotes and trailing slashes)
  if (wsUrl) {
    wsUrl = wsUrl.replace(/['"]+/g, '').replace(/\/+$/, '');
  }

  console.log(`[incoming-call] Received call. Bridging to WS: ${wsUrl}`);

  if (!wsUrl) {
    console.error("[incoming-call] PUBLIC_WS_URL is not set in environment variables.");
    const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We are experiencing a technical issue. Please try again later.</Say>
  <Hangup />
</Response>`;

    return new NextResponse(errorTwiml, {
      status: 200,
      headers: { "Content-Type": "text/xml" },
    });
  }

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Welcome to Ivora Pay TV Support. Please hold while I connect you to our AI assistant.</Say>
  <Connect>
    <Stream url="${wsUrl}/media-stream">
      <Parameter name="greeting" value="true" />
    </Stream>
  </Connect>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: { "Content-Type": "text/xml" },
  });
}

/**
 * GET handler — returns a simple health check so Twilio config
 * can verify the endpoint is reachable.
 */
export async function GET() {
  return NextResponse.json({
    status: "ok",
    service: "ivora-incoming-call",
    timestamp: new Date().toISOString(),
  });
}
