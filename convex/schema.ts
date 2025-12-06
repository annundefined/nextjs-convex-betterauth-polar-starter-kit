import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    name: v.string(),
    email: v.string(),
    image: v.optional(v.string()),
    emailVerified: v.optional(v.boolean()),
  }).index("byEmail", ["email"]),

  orders: defineTable({
    id: v.string(), // Polar order ID
    userId: v.string(),
    productId: v.string(),
    priceId: v.optional(v.string()),
    amount: v.number(), // Amount in cents
    currency: v.string(),
    createdAt: v.string(),
    modifiedAt: v.optional(v.string()),
    status: v.string(),
    checkoutId: v.optional(v.string()),
    metadata: v.optional(v.any()),
  })
    .index("byUserId", ["userId"])
    .index("byId", ["id"]),
});
