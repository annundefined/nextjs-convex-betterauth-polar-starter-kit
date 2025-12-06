"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { toast } from "sonner";
import type { Product, Purchase } from "@/types/polar";

// Helper component for rendering individual products
function ProductCard({ product }: { product: Product }) {
  const price = product.prices[0];
  const priceAmount = (price.priceAmount ?? 0) / 100;

  return (
    <div className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-xl font-bold mb-2">{product.name}</h3>
      <p className="text-gray-600 mb-4">{product.description}</p>
      <p className="text-2xl font-bold mb-6">
        ${priceAmount}
        <span className="text-sm font-normal text-gray-500">
          /{price.recurringInterval || "one-time"}
        </span>
      </p>

      <a
        href={`/checkout?products=${product.id}`}
        className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
      >
        Buy Now
      </a>
    </div>
  );
}

import Link from "next/link";

export default function DashboardPage() {
  const configuredProducts = useQuery(api.polar.getConfiguredProducts);
  const allProducts = useQuery(api.polar.listAllProducts);
  const purchases = useQuery(api.polar.myPurchases);
  const sync = useAction(api.polar.sync);
  const [syncing, setSyncing] = useState(false);

  const activeSubscription = purchases?.find(
    (p: Purchase) =>
      p.status === "active" &&
      p.product &&
      (p.product.isRecurring || p.product.is_recurring)
  );

  const handleSync = async () => {
    setSyncing(true);
    try {
      await sync();
      toast.success("Products synced successfully!");
    } catch (error) {
      toast.error("Failed to sync products: " + error);
    } finally {
      setSyncing(false);
    }
  };

  const subscriptions: Product[] = [];
  const oneTimeProducts: Product[] = [];

  if (configuredProducts) {
    (Object.values(configuredProducts) as (Product | undefined)[]).forEach((product) => {
      if (!product) return;
      // Check both cases just to be safe with the API response
      if (product.isRecurring || product.is_recurring) {
        subscriptions.push(product);
      } else {
        oneTimeProducts.push(product);
      }
    });

    const sortByPrice = (a: Product, b: Product) => {
      const priceA = a.prices[0]?.priceAmount ?? 0;
      const priceB = b.prices[0]?.priceAmount ?? 0;
      return priceA - priceB;
    };

    subscriptions.sort(sortByPrice);
    oneTimeProducts.sort(sortByPrice);
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Dashboard</h1>
      </div>

      {/* --- PRICING TABLES --- */}
      <div className="my-8">
        {!configuredProducts ? (
          <p>Loading configured products...</p>
        ) : Object.keys(configuredProducts).length === 0 ? (
          <p className="text-gray-500 italic">
            No configured products found. Check your IDs in{" "}
            <code>convex/polar.ts</code>.
          </p>
        ) : (
          <>
            {subscriptions.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">Subscriptions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {subscriptions.map((product) => {
                    const isCurrentPlan =
                      activeSubscription?.productId === product.id;
                    const hasActiveSubscription = !!activeSubscription;

                    return (
                      <div
                        key={product.id}
                        className={`border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow ${
                          isCurrentPlan
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                            : ""
                        }`}
                      >
                        <h3 className="text-xl font-bold mb-2">
                          {product.name}
                        </h3>
                        <p className="text-gray-600 mb-4">
                          {product.description}
                        </p>
                        <p className="text-2xl font-bold mb-6">
                          ${(product.prices[0].priceAmount ?? 0) / 100}
                          <span className="text-sm font-normal text-gray-500">
                            /{product.prices[0].recurringInterval || "one-time"}
                          </span>
                        </p>

                        {isCurrentPlan ? (
                          <Link
                            href="/dashboard/subscriptions"
                            className="block w-full text-center bg-green-600 text-white py-2 rounded hover:bg-green-700 transition-colors"
                          >
                            Manage Subscription
                          </Link>
                        ) : hasActiveSubscription ? (
                          <Link
                            href="/dashboard/subscriptions"
                            className="block w-full text-center bg-gray-800 text-white py-2 rounded hover:bg-gray-700 transition-colors"
                          >
                            Switch to this plan
                          </Link>
                        ) : (
                          <a
                            href={`/checkout?products=${product.id}`}
                            className="block w-full text-center bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                          >
                            Buy Now
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {oneTimeProducts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-4">
                  One-time Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {oneTimeProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* --- TESTING INSTRUCTIONS --- */}
      <div className="mt-12 p-6 border rounded-lg">
        <h3 className="mb-2 font-bold">Testing Instructions:</h3>
        <p className="mb-2">
          This is to test that your products in Polar.sh has been set up
          correctly and for a sample set it so you can make it your own.
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-100">
          <li>
            If you just created products in Polar, click{" "}
            <strong>Sync Products</strong> below. (Webhooks only catch{" "}
            <em>new</em> changes, so existing products must be synced manually
            once).
          </li>
          <li>
            Copy the <strong>ID</strong> from the Synced Products list below.
          </li>
          <li>
            Paste that ID into your <code>convex/polar.ts</code> file config.
          </li>
          <li>Resync again when all the product ids have been copied over.</li>
        </ol>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="my-4 bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {syncing ? "Syncing..." : "Sync Products from Polar"}
        </button>
        <div>
          You have {allProducts?.length} Synced Products:{" "}
          {allProducts?.map((prod) => (
            <p key={prod.id}>
              {prod.name} - id: {prod.id}
            </p>
          ))}
        </div>
      </div>
    </>
  );
}
