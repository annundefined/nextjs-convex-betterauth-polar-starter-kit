"use client";

import { useOptimistic, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

function DashboardNavButton({
  url,
  optimisticPath,
  isPending,
  handleNavigation,
  children,
}: {
  url: string;
  optimisticPath: string;
  isPending: boolean;
  handleNavigation: (url: string) => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={() => handleNavigation(url)}
      disabled={isPending}
      className={cn(
        "text-left text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200",
        optimisticPath === url && "underline",
        isPending && "opacity-50"
      )}
    >
      {children}
    </button>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const path = usePathname();
  const router = useRouter();

  const [optimisticPath, setOptimisticPath] = useOptimistic(
    path,
    (_state, newPath: string) => newPath
  );
  const [isPending, startTransition] = useTransition();

  const handleNavigation = (url: string) => {
    startTransition(() => {
      setOptimisticPath(url);
      router.push(url);
    });
  };

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-200 dark:bg-gray-800 p-4">
        <nav className="flex flex-col space-y-4">
          <DashboardNavButton
            url="/dashboard"
            optimisticPath={optimisticPath}
            isPending={isPending}
            handleNavigation={handleNavigation}
          >
            Dashboard
          </DashboardNavButton>
          <DashboardNavButton
            url="/dashboard/paid-only"
            optimisticPath={optimisticPath}
            isPending={isPending}
            handleNavigation={handleNavigation}
          >
            Paid Only
          </DashboardNavButton>
          <DashboardNavButton
            url="/dashboard/subscriptions"
            optimisticPath={optimisticPath}
            isPending={isPending}
            handleNavigation={handleNavigation}
          >
            Subscriptions
          </DashboardNavButton>
          <DashboardNavButton
            url="/dashboard/settings"
            optimisticPath={optimisticPath}
            isPending={isPending}
            handleNavigation={handleNavigation}
          >
            Settings
          </DashboardNavButton>
        </nav>
      </aside>
      <main className="flex-1 p-24">{children}</main>
    </div>
  );
}
