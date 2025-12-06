"use client";

import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import type { Product, Purchase } from "@/types/polar";

export default function SubscriptionsPage() {
  const user = useQuery(api.users.current);
  const purchases = useQuery(api.polar.myPurchases);
  const configuredProducts = useQuery(api.polar.getConfiguredProducts);
  const cancelSubscription = useAction(api.polar.cancelCurrentSubscription);
  const changeSubscription = useAction(api.polar.changeCurrentSubscription);
  const portalUrl = useAction(api.polar.generateCustomerPortalUrl);
  const syncSubscriptions = useAction(api.polar.syncSubscriptions);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      // Automatically sync subscriptions on load to ensure data is up-to-date
      syncSubscriptions().catch((err) =>
        console.error("Failed to sync subscriptions:", err)
      );
    }
  }, [user, syncSubscriptions]);

  if (purchases === undefined || configuredProducts === undefined) {
    return (
      <div className="p-6 bg-gray-100 rounded-lg dark:bg-gray-800 animate-pulse">
        <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  const subscriptions = purchases.filter(
    (p: Purchase): p is Purchase & { product: Product } =>
      !!p.product && (p.product.isRecurring || !!p.product.is_recurring)
  );

  const activeSubscription = subscriptions.find(
    (s: Purchase) => s.status === "active" || s.status === "trialing"
  );

  const handlePortal = async () => {
    setLoading(true);
    try {
      const { url } = await portalUrl();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to generate portal URL: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;
    setLoading(true);
    try {
      await cancelSubscription({});
      await syncSubscriptions();
      toast.success("Subscription cancelled successfully.");
    } catch (error) {
      toast.error("Failed to cancel subscription: " + error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = async (productId: string) => {
    if (!confirm("Are you sure you want to change your subscription?")) return;
    setLoading(true);
    try {
      await changeSubscription({ productId });
      await syncSubscriptions();
      toast.success("Subscription updated successfully.");
    } catch (error) {
      toast.error("Failed to update subscription: " + error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Manage Subscriptions</h1>
        <button
          onClick={handlePortal}
          disabled={loading}
          className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-700 disabled:opacity-50"
        >
          {loading ? "Loading..." : "Open Billing Portal"}
        </button>
      </div>

      <div className="space-y-8">
        {activeSubscription ? (
          <div className="border rounded-lg p-6 bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-800">
            <h2 className="text-2xl font-bold mb-4">Current Subscription</h2>
            <div className="mb-4">
              <p className="text-lg font-semibold">
                {activeSubscription.product?.name}
              </p>
              <p className="text-gray-600 dark:text-gray-300">
                {activeSubscription.product?.description}
              </p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Status:{" "}
                <span className="capitalize font-bold text-green-700 dark:text-green-300">
                  {activeSubscription.status}
                </span>
              </p>
            </div>
            <button
              onClick={handleCancel}
              disabled={loading}
              className="text-red-600 hover:text-red-800 underline disabled:opacity-50"
            >
              Cancel Subscription
            </button>
          </div>
        ) : (
          <div className="p-6 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p className="text-yellow-800 dark:text-yellow-100">
              You do not have an active subscription.
            </p>
          </div>
        )}

        {/* Upgrade/Downgrade Options */}
        {activeSubscription && configuredProducts && (
          <div>
            <h3 className="text-xl font-bold mb-4">Available Plans</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(Object.values(configuredProducts || {}) as (Product | undefined)[]).map((product) => {
                if (
                  !product ||
                  (!product.isRecurring && !product.is_recurring) ||
                  product.id === activeSubscription.productId
                )
                  return null;

                const price = product.prices[0];
                const priceAmount = (price.priceAmount ?? 0) / 100;

                return (
                  <div
                    key={product.id}
                    className="border rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow bg-white dark:bg-gray-800"
                  >
                    <h4 className="text-lg font-bold mb-2">{product.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {product.description}
                    </p>
                    <p className="text-xl font-bold mb-4">
                      ${priceAmount}
                      <span className="text-sm font-normal text-gray-500">
                        /{price.recurringInterval}
                      </span>
                    </p>
                    <button
                      onClick={() => handleChange(product.id)}
                      disabled={loading}
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      Switch to {product.name}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
