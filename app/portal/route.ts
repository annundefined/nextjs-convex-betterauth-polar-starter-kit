/**
 * Customer Portal Route
 *
 * Redirects authenticated users to their Polar.sh billing portal
 * where they can manage payment methods, view invoices, and update billing info.
 *
 * Note: The getCustomerId function needs to be implemented to resolve
 * the Polar Customer ID for the current user from your database.
 *
 * @see https://polar.sh/docs for more information
 */

import { CustomerPortal } from "@polar-sh/nextjs";
import { NextRequest } from "next/server";

export const GET = CustomerPortal({
  accessToken: process.env.POLAR_ACCESS_TOKEN!,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getCustomerId: async (req: NextRequest) => {
    // TODO: Implement logic to resolve the Polar Customer ID for the current user.
    // You might need to query your database or decode a session token.
    return "";
  },
  returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`,
  // Set POLAR_ENVIRONMENT to "production" when ready to go live
  server:
    (process.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "sandbox",
});
