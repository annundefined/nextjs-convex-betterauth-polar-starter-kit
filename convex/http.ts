/**
 * HTTP Routes
 *
 * This file defines all HTTP endpoints for your Convex backend:
 * - Better Auth routes (handled automatically by authComponent.registerRoutes)
 * - Polar webhook routes for subscription events (/polar/events)
 * - Custom webhook routes for order events (/polar/custom_events)
 *
 * Webhooks are verified using secrets stored in Convex environment variables.
 */

import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { polar } from "./polar";
import { validateEvent } from "@polar-sh/sdk/webhooks";
import { authComponent, createAuth } from "./auth";

const http = httpRouter();

authComponent.registerRoutes(http, createAuth);

// 1. Standard Polar events handled by the component (Subscriptions, etc.)
// Uses POLAR_WEBHOOK_SECRET
polar.registerRoutes(http, {
  path: "/polar/events",
  onSubscriptionUpdated: async (ctx, event) => {
    if (event.data.customerCancellationReason) {
      console.log("Customer cancelled:", event.data.customerCancellationReason);
    }
  },
  onSubscriptionCreated: async (ctx, event) => {
    console.log("Subscription created:", event.data.id);
  },
  onProductCreated: async (ctx, event) => {
    console.log("Product created:", event.data.name);
  },
  onProductUpdated: async (ctx, event) => {
    console.log("Product updated:", event.data.name);
  },
});

// 2. Custom webhook handler for Orders (One-time purchases)
// Uses a NEW environment variable to avoid conflicts if you have two webhooks
http.route({
  path: "/polar/custom_events",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    // We use a specific secret for this custom webhook to ensure safety
    // You must set this in your Convex dashboard
    const webhookSecret = process.env.POLAR_CUSTOM_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error(
        "POLAR_CUSTOM_WEBHOOK_SECRET is not set. Please add it to your Convex Dashboard environment variables."
      );
      return new Response("Internal Server Error: Missing Webhook Secret", {
        status: 500,
      });
    }

    // Use standard Request methods to get body and headers
    const payload = await request.text();
    const headers: Record<string, string> = {};
    request.headers.forEach((value, key) => {
      headers[key] = value;
    });

    // Use Polar's official SDK validator which handles their specific signing method
    // This fixes the "Base64Coder" error by using the correct verification logic
    let event;
    try {
      event = validateEvent(payload, headers, webhookSecret);
    } catch (err) {
      console.error("Webhook verification failed:", err);
      return new Response("Webhook verification failed", { status: 400 });
    }

    if (event.type === "order.created") {
      // Polar SDK order data - using any because field names vary between SDK versions (camelCase vs snake_case)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = event.data as Record<string, any>;
      console.log("Order created:", data.id);
      await ctx.runMutation(internal.orders.upsertOrder, {
        id: data.id,
        // Fallback to snake_case if camelCase is missing (or vice versa) to be safe across SDK versions
        email:
          data.customerEmail ?? data.customer_email ?? data.customer?.email,
        productId: data.productId ?? data.product_id,
        priceId:
          data.productPriceId ??
          data.product_price_id ??
          data.price_id ??
          data.priceId,
        amount: data.amount ?? data.total ?? data.totalAmount,
        currency: data.currency,
        // Convert Date object to ISO string for Convex
        createdAt:
          data.createdAt instanceof Date
            ? data.createdAt.toISOString()
            : data.createdAt ?? data.created_at,
        status: "paid",
        metadata: data.metadata,
      });
    }

    return new Response(null, { status: 200 });
  }),
});

export default http;
