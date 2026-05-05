/**
 * DTMF Fallback Handler
 *
 * When the AI fails to understand the caller after multiple attempts,
 * we switch to a traditional keypad-based menu as a safety net.
 *
 * The handler maps DTMF digits to predefined actions.
 */

export interface DTMFAction {
  /** Text for the AI to speak back to the caller. */
  spokenResponse: string;
  /** The logical intent this maps to. */
  intent: "error_code_help" | "subscription_status" | "speak_to_agent" | "unknown";
}

/** The spoken prompt when entering DTMF fallback mode. */
export const DTMF_MENU_PROMPT =
  "I'm having trouble understanding you. Let me offer you some options. " +
  "Press 1 for help with an error code. " +
  "Press 2 to check your subscription status. " +
  "Press 3 to speak with a human agent.";

/**
 * Maps a DTMF digit to an action.
 */
export function handleDTMFDigit(digit: string): DTMFAction {
  switch (digit) {
    case "1":
      return {
        spokenResponse:
          "You selected error code help. Please say or enter the error code showing on your screen.",
        intent: "error_code_help",
      };
    case "2":
      return {
        spokenResponse:
          "You selected subscription status. Please say or enter your IUC or smartcard number.",
        intent: "subscription_status",
      };
    case "3":
      return {
        spokenResponse:
          "I'll connect you with a human agent now. Please hold.",
        intent: "speak_to_agent",
      };
    default:
      return {
        spokenResponse:
          "Sorry, that option is not recognized. " +
          "Press 1 for error code help, 2 for subscription status, or 3 to speak with an agent.",
        intent: "unknown",
      };
  }
}
