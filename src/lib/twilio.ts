import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

/**
 * Redirects an active Twilio call to a human agent.
 * 
 * Since we are in a <Stream>, we use the REST API to update the call
 * with new TwiML that contains the <Dial> instruction.
 */
export async function redirectToAgent(callSid: string, reason: string): Promise<void> {
  const agentPhoneNumber = process.env.AGENT_PHONE_NUMBER;

  if (!agentPhoneNumber) {
    throw new Error("AGENT_PHONE_NUMBER is not configured.");
  }

  console.log(`[twilio] Redirecting call ${callSid} to agent. Reason: ${reason}`);

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">Please stay on the line while I connect you to a human agent who can help with ${reason}.</Say>
  <Dial>${agentPhoneNumber}</Dial>
</Response>`;

  await client.calls(callSid).update({ twiml });
}
