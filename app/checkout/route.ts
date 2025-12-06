import { Checkout } from "@polar-sh/nextjs";

export const GET = Checkout({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}${process.env.POLAR_SUCCESS_URL}`,
  returnUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/dashboard`, // Back button returns to dashboard
  // Set POLAR_ENVIRONMENT to "production" when ready to go live
  server:
    (process.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "sandbox",
  theme: "dark", // Enforces the theme - System-preferred theme will be set if left omitted
});
