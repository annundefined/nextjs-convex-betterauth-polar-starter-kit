import { Resend } from "@convex-dev/resend";
import { components } from "./_generated/api";

// Set testMode to false when ready to send real emails
// Requires RESEND_API_KEY in Convex environment variables
export const resend = new Resend(components.resend, {
  testMode: true,
});
