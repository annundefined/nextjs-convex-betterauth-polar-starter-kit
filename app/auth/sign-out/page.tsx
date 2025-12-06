"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "@/lib/auth";

export default function SignOutPage() {
  const router = useRouter();

  useEffect(() => {
    async function handleSignOut() {
      await signOut();
      router.push("/");
    }
    handleSignOut();
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p className="text-gray-500">Signing out...</p>
    </div>
  );
}
