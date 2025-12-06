"use client";

import Link from "next/link";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { UserButton } from "@daveyplate/better-auth-ui";

/**
 * Header component that displays navigation links and authentication buttons.
 * It adapts based on the user's authentication state (loading, authenticated, unauthenticated).
 */
export function Header() {
  return (
    <header className="sticky top-0 z-50 flex w-full items-center justify-between border-b bg-white p-4 dark:bg-black">
      <div className="flex items-center gap-6">
        <Link href="/" className="text-lg font-bold">
          Starter Kit
        </Link>
        <nav className="flex gap-4 text-sm font-medium">
          <Link href="/about" className="hover:underline">
            About
          </Link>
          <Link href="/sample" className="hover:underline">
            Sample
          </Link>
        </nav>
      </div>

      <div className="flex items-center gap-4">
        <AuthLoading>
          <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200 dark:bg-gray-800" />
        </AuthLoading>

        <Authenticated>
          <Link href="/dashboard" className="hover:underline">
            Dashboard
          </Link>
          <UserButton
            size="icon"
            classNames={{
              trigger: {
                base: "focus-visible:ring-0 focus-visible:ring-offset-0",
              },
              content: {
                base: "bg-popover border border-border shadow-md",
              },
            }}
          />
        </Authenticated>

        <Unauthenticated>
          <Link href="/auth/sign-in">
            <button className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Sign In
            </button>
          </Link>
          <Link href="/auth/sign-up">
            <button className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200">
              Sign Up
            </button>
          </Link>
        </Unauthenticated>
      </div>
    </header>
  );
}
