"use client";

/**
 * Account Settings Page
 *
 * Provides user account management including:
 * - Profile information (name, email, avatar)
 * - Password changes
 * - Account deletion
 *
 * Uses Better Auth UI components for the forms.
 */

import {
  AccountSettingsCards,
  DeleteAccountCard,
} from "@daveyplate/better-auth-ui";

export default function SettingsPage() {
  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <h1 className="text-2xl font-bold mb-8">Account Settings</h1>
      <AccountSettingsCards className="space-y-6" />
      <DeleteAccountCard className="mt-12" />
    </div>
  );
}
