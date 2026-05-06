# IVORA — Testing & Validation Guide

This guide explains how to perform an end-to-end test of the AI-powered IVR diagnostic system in a local development environment.

## 1. Prerequisites
- **Twilio Account**: A phone number configured for Voice.
- **OpenAI API Key**: With access to the Realtime API (`gpt-4o-realtime-preview`).
- **MongoDB**: Running locally or a MongoDB Atlas connection string.
- **Ngrok**: Installed and authenticated.
- **CLUBKASH (Nellobyte) API**: To verify the IUC or smartcard number

## 2. Environment Setup (.env)
Ensure your `.env` file contains the following:

```bash
# OpenAI
OPENAI_API_KEY=sk-...

# Twilio
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_PHONE_NUMBER=+1...

# CLUBKASH (Nellobyte) API
CLUBKASH_USERID=....
CLUBKASH_API_KEY=...

# Human Agent Transfer (Your personal number for testing)
AGENT_PHONE_NUMBER=+44...

# WebSocket Bridge (Set after starting ngrok)
PUBLIC_WS_URL=wss://your-id.ngrok.io
```

## 3. Local Infrastructure

### Step A: Start MongoDB
Ensure your MongoDB instance is running.

### Step B: Start the Ngrok Tunnel

> **⚠️ IMPORTANT: You only need ONE ngrok tunnel. The backend server (port 8080) handles BOTH the Twilio webhook AND the WebSocket audio stream.**

**Run this single command:**
```bash
ngrok http 8080
```

You will see a `Forwarding` line in the terminal like:
```
Forwarding   https://abc-123.ngrok-free.app -> http://localhost:8080
```

**Now do TWO things with that URL:**

**① Update your `.env` file — change `https://` to `wss://`:**
```env
PUBLIC_WS_URL="wss://abc-123.ngrok-free.app"
```

**② Keep the `https://` version for Twilio (Step C below).**

---

### Step C: Configure Twilio Webhook

> **Use the SAME ngrok `https://` URL from Step B — do NOT start a second tunnel.**

1. Go to **Twilio Console** > **Phone Numbers** > **Manage** > **TwiML Apps**
2. Create a new app and in the request URL, enter:
   **`https://abc-123.ngrok-free.app/incoming-call`**
   *(replace `abc-123.ngrok-free.app` with your actual ngrok URL)*
3. Set the method to **HTTP POST**.
4. Click **Save**.

## 4. Running the Application
Open three terminal tabs:

1. **Tab 1 (Seed Data)**:
   ```bash
   npm run db:seed
   ```
2. **Tab 2 (WS Server)**:
   ```bash
   npm run server:dev
   ```
3. **Tab 3 (Next.js)**:
   ```bash
   npm run dev
   ```

## 5. Test Scenarios

### Scenario 1: Basic Diagnosis (Active Subscription)
1. Call your Twilio number.
2. AI: "Hello, this is Ivora... how can I help you?"
3. You: "I'm seeing Error E16 on my DStv."
4. AI: "I can help with that. What is your IUC number?"
5. You: "My number is 1234567890"
6. **Expectation**: AI should confirm you have an active subscription and guide you to dial *288# to refresh your signal.

### Scenario 2: Expired Subscription
1. Call again.
2. Provide IUC number `1234567891`
3. **Expectation**: AI should inform you that your subscription has expired and guide you to renewal options.

### Scenario 3: Barge-in (Interruption)
1. While the AI is giving a long explanation, interrupt it: "Wait, tell me that again!"
2. **Expectation**: The AI should stop talking immediately, acknowledge the interruption, and respond to your new query.

### Scenario 4: Human Agent Transfer
1. Say: "I want to speak to a human" or "This isn't working, transfer me."
2. **Expectation**: AI says it's connecting you. Your `AGENT_PHONE_NUMBER` should start ringing.

### Scenario 5: DTMF Fallback
1. Stay silent or speak gibberish for several turns to frustrate the AI.
2. **Expectation**: After 5 consecutive interruptions or failures, the AI should trigger the DTMF menu: "I'm having trouble understanding. Press 1 for help, 2 for status..."

## 6. Verification
- **Terminal**: Watch the `npm run server:dev` logs for real-time tool calls and audio events.
- **Database**: Open MongoDB Compass or use `mongosh`. Query the `callsessions` collection to see the full transcript and tool execution logs.

## 7. Troubleshooting
- **No Audio**: Check if `OPENAI_API_KEY` is valid and has credits.
- **404 on Webhook**: Ensure ngrok is pointing to the correct port (3002 for Next.js).
- **MongoDB Error**: Ensure `MONGODB_URI` is correct and the database is reachable.
