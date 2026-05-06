import "dotenv/config";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { CallHandler } from "./handlers/call-handler";
import { connectDB, disconnectDB } from "../src/lib/db";

const PORT = parseInt(process.env.PORT || process.env.WS_PORT || "8080", 10);

const activeHandlers = new Set<CallHandler>();

// HTTP Server (health check + status)
const httpServer = createServer((req: IncomingMessage, res: ServerResponse) => {
  console.log(`[http] ${req.method} ${req.url} - User-Agent: ${req.headers["user-agent"]}`);

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        status: "ok",
        service: "ivora-ws-server",
        activeCalls: activeHandlers.size,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
      }),
    );
    return;
  }

  // ── Twilio Incoming Call Webhook ──
  // Serves TwiML directly from the same server as the WebSocket.
  // This means we only need ONE tunnel (ngrok) for both the webhook and the stream.
  if (req.method === "POST" && req.url === "/incoming-call") {
    const publicUrl = process.env.PUBLIC_WS_URL?.replace(/['"]+/g, "").replace(/\/+$/, "");

    if (!publicUrl) {
      console.error("[incoming-call] PUBLIC_WS_URL is not set.");
      const errorTwiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We are experiencing a technical issue. Please try again later.</Say>
  <Hangup />
</Response>`;
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(errorTwiml);
      return;
    }

    console.log(`[incoming-call] Received call. Bridging to WS: ${publicUrl}/media-stream`);

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${publicUrl}/media-stream" track="inbound_track">
      <Parameter name="greeting" value="true" />
    </Stream>
  </Connect>
</Response>`;

    res.writeHead(200, { "Content-Type": "text/xml" });
    res.end(twiml);
    return;
  }

  // ── Default ──
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ status: "ok", service: "ivora-ws-server" }));
});


// WebSocket Server

const wss = new WebSocketServer({ server: httpServer, path: "/media-stream" });

wss.on("connection", (twilioWs: WebSocket) => {
  console.log(`[server] New Twilio connection. Active calls: ${activeHandlers.size + 1}`);

  const handler = new CallHandler(twilioWs, () => {
    // Cleanup callback: remove from active set when call ends
    activeHandlers.delete(handler);
    console.log(`[server] Call ended. Active calls: ${activeHandlers.size}`);
  });

  activeHandlers.add(handler);
  handler.init();
});

wss.on("error", (error) => {
  console.error("[server] WebSocket server error:", error);
});

// Startup
async function start() {
  // Connect to MongoDB before accepting calls
  try {
    await connectDB();
    console.log("[server] MongoDB connected.");
  } catch (error) {
    console.warn(
      "[server] MongoDB connection failed. Calls will work but data won't be persisted:",
      (error as Error).message,
    );
  }

  httpServer.listen(PORT, () => {
    console.log(`[server] Ivora WS server listening on port ${PORT}`);
    console.log(`[server] Media stream endpoint: ws://localhost:${PORT}/media-stream`);
    console.log(`[server] Health check: http://localhost:${PORT}/health`);
  });
}

// Graceful Shutdown
let isShuttingDown = false;

async function shutdown(signal: string) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`\n[server] Received ${signal}. Shutting down gracefully...`);

  // 1. Stop accepting new connections
  wss.close(() => {
    console.log("[server] WebSocket server closed.");
  });

  // 2. Close all active call handlers
  console.log(`[server] Closing ${activeHandlers.size} active call(s)...`);
  for (const handler of activeHandlers) {
    handler.forceClose();
  }
  activeHandlers.clear();

  // 3. Close HTTP server
  httpServer.close(() => {
    console.log("[server] HTTP server closed.");
  });

  // 4. Disconnect from MongoDB
  try {
    await disconnectDB();
  } catch {
    // Already logged by disconnectDB
  }

  console.log("[server] Shutdown complete.");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));

// Catch unhandled errors so the server doesn't crash on a single bad call
process.on("uncaughtException", (error) => {
  console.error("[server] Uncaught exception:", error);
  // Don't exit — keep serving other calls
});

process.on("unhandledRejection", (reason) => {
  console.error("[server] Unhandled rejection:", reason);
  // Don't exit — keep serving other calls
});

// Start the server with command
start();
