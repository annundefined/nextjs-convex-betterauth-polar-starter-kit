"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Product, Purchase } from "@/types/polar";

function FreeContent() {
  return (
    <>
      This is the &apos;free content&apos; you are seeing right now. This would
      be good to also include up-selling like an upgrade nudge card. Subscribe
      to some paid tier and you will see different content.
    </>
  );
}

function PaidContent({ purchases }: { purchases: Purchase[] }) {
  const subscriptions = purchases.filter(
    (p: Purchase): p is Purchase & { product: Product } =>
      !!p.product && p.product.isRecurring
  );
  const oneTimePurchases = purchases.filter(
    (p: Purchase): p is Purchase & { product: Product } =>
      !!p.product && !p.product.isRecurring
  );

  // Count single products
  const singleProductCounts: Record<
    string,
    { count: number; product: Product }
  > = {};

  oneTimePurchases.forEach((p) => {
    const id = p.productId;
    if (!singleProductCounts[id]) {
      singleProductCounts[id] = { count: 0, product: p.product };
    }
    singleProductCounts[id].count++;
  });

  return (
    <div className="space-y-6">
      <div className="text-xl">This is the awesome Content you paid for! It 
        provides simple logic examples to show specific content based on the 
        user&apos;s subscription tier and/or one-time purchases.</div>

      {subscriptions.length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-2">Active Subscriptions</h3>
          <ul className="list-disc pl-5">
            {subscriptions.map((sub: Purchase) => (
              <li key={sub.id}>
                {sub.product?.name ?? "Unknown Product"} ({sub.status})
              </li>
            ))}
          </ul>
        </div>
      )}

      {Object.keys(singleProductCounts).length > 0 && (
        <div>
          <h3 className="text-lg font-bold mb-2">Purchased Products</h3>
          <ul className="list-disc pl-5">
            {Object.entries(singleProductCounts).map(
              ([id, { count, product }]) => (
                <li key={id}>
                  {product.name}: {count} purchased
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PaidOnlyPage() {
  // Use useQuery with optimistic updates or better loading states
  const purchases = useQuery(api.polar.myPurchases);

  // If we are loading, show a skeleton or loading state that implies premium content might be coming
  if (purchases === undefined) {
    return (
      <div>
        <h1 className="text-4xl font-bold mb-8">Paid only</h1>
        <div className="p-6 bg-gray-100 rounded-lg dark:bg-gray-800 animate-pulse">
          <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const hasPurchases = purchases.length > 0;

  return (
    <div>
      <h1 className="text-4xl font-bold mb-8">Paid only</h1>

      <div
        className={`p-6 rounded-lg ${
          hasPurchases
            ? "bg-green-100 dark:bg-green-900"
            : "bg-gray-100 dark:bg-gray-800"
        }`}
      >
        <h2
          className={`text-2xl font-semibold ${
            hasPurchases
              ? "text-green-800 dark:text-green-100"
              : "text-gray-800 dark:text-gray-100"
          }`}
        >
          {hasPurchases ? "Your content below:" : "Premium Content"}
        </h2>
        <div
          className={`mt-2 ${
            hasPurchases
              ? "text-green-700 dark:text-green-200"
              : "text-gray-700 dark:text-gray-200"
          }`}
        >
          {hasPurchases ? (
            <PaidContent purchases={purchases} />
          ) : (
            <FreeContent />
          )}
        </div>
      </div>
    </div>
  );
}
