/**
 * Orders Module
 *
 * Handles one-time purchase orders from Polar.sh webhooks.
 * Orders are stored locally and linked to users by email.
 *
 * Note: This is separate from subscriptions, which are managed
 * by the @convex-dev/polar component.
 */

import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { components } from "./_generated/api";

export const upsertOrder = internalMutation({
  args: {
    id: v.string(),
    email: v.optional(v.string()), // Email from webhook
    productId: v.string(),
    priceId: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    createdAt: v.string(),
    modifiedAt: v.optional(v.string()),
    status: v.string(),
    checkoutId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // 1. Resolve user by email
    let userId;
    if (args.email) {
      const user = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "email", value: args.email }],
      });
      userId = (user as { _id?: string } | null)?._id;
    }

    // If no user found, we log a warning.
    // In a real app, you might want to store these in a "unclaimed" orders table or retry later.
    if (!userId) {
      console.warn(
        `Order ${args.id} received for email ${args.email} but no user found. Order will be skipped.`
      );
      return;
    }

    const orderData = {
      id: args.id,
      userId: userId,
      productId: args.productId,
      priceId: args.priceId,
      amount: args.amount,
      currency: args.currency,
      createdAt: args.createdAt,
      modifiedAt: args.modifiedAt,
      status: args.status,
      checkoutId: args.checkoutId,
      metadata: args.metadata,
    };

    const existingOrder = await ctx.db
      .query("orders")
      .withIndex("byId", (q) => q.eq("id", args.id))
      .unique();

    if (existingOrder) {
      await ctx.db.patch(existingOrder._id, orderData);
    } else {
      await ctx.db.insert("orders", orderData);
    }
  },
});

export const listUserOrders = internalQuery({
  args: { userId: v.string() },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("orders")
      .withIndex("byUserId", (q) => q.eq("userId", userId))
      .collect();
  },
});
