"use client";

import { AuthView } from "@daveyplate/better-auth-ui";

export default function SignUpPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <AuthView className="w-sm" view="SIGN_UP" />
    </div>
  );
}
