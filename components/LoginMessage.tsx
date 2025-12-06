"use client";

import { Authenticated, Unauthenticated } from "convex/react";
import Link from "next/link";

/**
 * A component that displays a welcome message based on the user's authentication state.
 * Shows a secret message if logged in, or a prompt to sign in otherwise.
 */
export default function LoginMessage() {
  return (
    <div className="mt-20">
      <Authenticated>
        <p className="text-green-700 dark:text-green-200">
          Welcome back! You are logged in and can view this secret message.
        </p>
      </Authenticated>

      <Unauthenticated>
        <p className="text-red-700 dark:text-red-200 mb-4">
          Sign in to see a different message.
        </p>
      </Unauthenticated>
    </div>
  );
}
