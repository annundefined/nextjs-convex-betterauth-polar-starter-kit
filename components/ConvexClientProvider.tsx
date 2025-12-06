"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { AuthUIProvider } from "@daveyplate/better-auth-ui";
import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { authClient } from "@/lib/auth";

if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error("Missing NEXT_PUBLIC_CONVEX_URL in your .env file");
}

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL);

/**
 * A provider component that wraps the application with Convex and BetterAuth providers.
 * It enables Convex React hooks and BetterAuth authentication integration.
 */
export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ConvexBetterAuthProvider client={convex} authClient={authClient}>
      <AuthUIProvider
        authClient={authClient}
        social={{ providers: ["google"] }}
        basePath="/auth"
        deleteUser={true}
        account={{ basePath: "/dashboard" }}
        viewPaths={{
          SIGN_IN: "sign-in",
          SIGN_UP: "sign-up",
          FORGOT_PASSWORD: "forgot-password",
          SIGN_OUT: "sign-out",
        }}
      >
        {children}
      </AuthUIProvider>
    </ConvexBetterAuthProvider>
  );
}
