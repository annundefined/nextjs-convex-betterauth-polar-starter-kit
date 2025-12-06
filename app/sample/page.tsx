"use client";

/**
 * Sample Protected Page
 *
 * Demonstrates how to show different content based on authentication state
 * using Convex's Authenticated/Unauthenticated components.
 *
 * Use this as a template for creating your own protected pages.
 */

import { Authenticated, Unauthenticated } from "convex/react";

export default function SamplePage() {
  return (
    <div className="flex min-h-screen flex-col p-24">
      <h1 className="text-4xl font-bold mb-8">Sample Protected Page</h1>

      <Authenticated>
        <div className="p-6 bg-green-100 rounded-lg dark:bg-green-900">
          <h2 className="text-2xl font-semibold text-green-800 dark:text-green-100">
            Welcome back!
          </h2>
          <p className="mt-2 text-green-700 dark:text-green-200">
            You are logged in and can view this secret protected content.
          </p>
        </div>
      </Authenticated>

      <Unauthenticated>
        <div className="p-6 bg-red-100 rounded-lg dark:bg-red-900">
          <h2 className="text-2xl font-semibold text-red-800 dark:text-red-100">
            Access Denied
          </h2>
          <p className="mt-2 text-red-700 dark:text-red-200">
            Please sign in to view this content.
          </p>
        </div>
      </Unauthenticated>
    </div>
  );
}
