import { Polar } from "@convex-dev/polar";
import { components, internal } from "./_generated/api";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { query, action } from "./_generated/server";
import { customersCreate } from "@polar-sh/sdk/funcs/customersCreate.js";
import { customersList } from "@polar-sh/sdk/funcs/customersList.js";
import { subscriptionsList } from "@polar-sh/sdk/funcs/subscriptionsList.js";
import { customerSessionsCreate } from "@polar-sh/sdk/funcs/customerSessionsCreate.js";

export const polar = new Polar(components.polar, {
  // Set POLAR_ENVIRONMENT in your env vars. Defaults to "sandbox" for safe development.
  // Use "production" when ready to go live.
  server:
    (process.env.POLAR_ENVIRONMENT as "sandbox" | "production") || "sandbox",
  // TODO: Replace these with your actual Polar product IDs.
  // Note: The @convex-dev/polar component is primarily designed for recurring subscriptions.
  // One-time payments may not work as fully expected with the current component version.
  products: {
    // Single Products
    Small: "b9204238-8c20-4df3-a55f-d91d2d51e538",
    Medium: "26594029-4c4f-4d82-805a-94954be42261",
    Large: "b7d6d4eb-ba8e-43b6-bbec-a34a09bc2d25",
    // Subscription Tiers
    Free: "d1ac8dce-3449-4ee8-9347-6fc9ff300aaf",
    Cheap: "8eb259ed-017a-4953-8c01-075dbc0f9009",
    Expensive: "3b6b6c6b-4819-498f-937c-bcac10b740f0",
  },
  getUserInfo: async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ctx: { runQuery: (q: any, args: any) => Promise<any> }
  ): Promise<{ userId: string; email: string }> => {
    const user = await ctx.runQuery(api.users.current, {});

    if (!user) {
      throw new Error("User not found");
    }

    return {
      userId: user._id,
      email: user.email!,
    };
  },
});

export const {
  changeCurrentSubscription,
  cancelCurrentSubscription,
  getConfiguredProducts,
  listAllProducts,
  generateCheckoutLink,
  // We override generateCustomerPortalUrl below
} = polar.api();

export const sync = action({
  args: {},
  handler: async (ctx) => {
    await polar.syncProducts(ctx);
  },
});

// Define a minimal interface for the subscription object from Polar SDK
// since importing the full type might be complex or unavailable directly
interface PolarSubscription {
  id: string;
  customerId: string;
  createdAt: Date;
  modifiedAt?: Date | null;
  productId: string;
  checkoutId?: string | null;
  amount?: number | null;
  currency?: string | null;
  recurringInterval?: string | null;
  status: string;
  currentPeriodStart: Date;
  currentPeriodEnd?: Date | null;
  cancelAtPeriodEnd?: boolean;
  customerCancellationReason?: string | null;
  customerCancellationComment?: string | null;
  startedAt?: Date | null;
  endedAt?: Date | null;
  metadata?: Record<string, unknown>;
}

interface DbSubscription {
  id: string;
  customerId: string;
  createdAt: string;
  modifiedAt?: string | null;
  productId: string;
  checkoutId?: string | null;
  amount?: number | null;
  currency?: string | null;
  recurringInterval?: string | null;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
  customerCancellationReason?: string | null;
  customerCancellationComment?: string | null;
  startedAt?: string | null;
  endedAt?: string | null;
  metadata?: Record<string, unknown>;
}

interface Order {
  _id: Id<"orders">;
  _creationTime: number;
  id: string;
  userId: string;
  productId: string;
  priceId?: string;
  amount: number;
  currency: string;
  createdAt: string;
  modifiedAt?: string;
  status: string;
  checkoutId?: string;
  metadata?: Record<string, unknown>;
}

const convertToDatabaseSubscription = (subscription: PolarSubscription) => {
  return {
    id: subscription.id,
    customerId: subscription.customerId,
    createdAt: subscription.createdAt.toISOString(),
    modifiedAt: subscription.modifiedAt?.toISOString() ?? null,
    productId: subscription.productId,
    checkoutId: subscription.checkoutId ?? null,
    amount: subscription.amount ?? null,
    currency: subscription.currency ?? null,
    recurringInterval: subscription.recurringInterval as
      | "day"
      | "week"
      | "month"
      | "year"
      | null,
    status: subscription.status,
    currentPeriodStart: subscription.currentPeriodStart.toISOString(),
    currentPeriodEnd: subscription.currentPeriodEnd?.toISOString() ?? null,
    cancelAtPeriodEnd: subscription.cancelAtPeriodEnd ?? false,
    customerCancellationReason: subscription.customerCancellationReason ?? null,
    customerCancellationComment:
      subscription.customerCancellationComment ?? null,
    startedAt: subscription.startedAt?.toISOString() ?? null,
    endedAt: subscription.endedAt?.toISOString() ?? null,
    metadata: subscription.metadata ?? {},
  };
};

export const syncSubscriptions = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.current);

    if (!user) {
      console.warn("syncSubscriptions called but no user is logged in");
      return;
    }
    if (!user.email) {
      console.warn("User has no email address, skipping sync");
      return;
    }

    // Get Polar Customer ID first
    let customerId: string | undefined;
    const customerListIter = await customersList(polar.polar, {
      email: user.email,
      limit: 1,
    });

    for await (const page of customerListIter) {
      if (page.ok && page.value.result.items.length > 0) {
        customerId = page.value.result.items[0].id;
        break;
      }
    }

    if (!customerId) {
      // No customer in Polar, so no subscriptions
      return;
    }

    try {
      // List subscriptions from Polar
      const listIter = await subscriptionsList(polar.polar, {
        customerId: customerId,
      });

      for await (const page of listIter) {
        if (page.ok) {
          for (const subscription of page.value.result.items) {
            const dbSubscription = await ctx.runQuery(
              components.polar.lib.getSubscription,
              { id: subscription.id }
            );

            if (dbSubscription) {
              await ctx.runMutation(components.polar.lib.updateSubscription, {
                subscription: convertToDatabaseSubscription(subscription),
              });
            } else {
              await ctx.runMutation(components.polar.lib.createSubscription, {
                subscription: convertToDatabaseSubscription(subscription),
              });
            }
          }
        } else {
          console.error("Failed to list subscriptions page:", page.error);
        }
      }
    } catch (error) {
      console.error("Error syncing subscriptions:", error);
      throw new Error("Failed to sync subscriptions");
    }
  },
});

export const myPurchases = query({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.current);
    if (!user) {
      return [];
    }

    const subscriptions: DbSubscription[] = await ctx.runQuery(
      components.polar.lib.listUserSubscriptions,
      {
        userId: user._id,
      }
    );

    const orders: Order[] = await ctx.runQuery(internal.orders.listUserOrders, {
      userId: user._id,
    });

    const allProducts = await ctx.runQuery(
      components.polar.lib.listProducts,
      {}
    );

    const productsMap = new Map(allProducts.map((p) => [p.id, p]));

    const ordersWithProducts = (orders as Order[])
      .map((order) => {
        const product = productsMap.get(order.productId);
        return {
          ...order,
          product: product || null,
        };
      })
      .filter((o) => o.product);

    const subscriptionsWithProducts = subscriptions
      .map((subscription) => {
        const product = productsMap.get(subscription.productId);
        return {
          ...subscription,
          product: product || null,
        };
      })
      .filter((s) => s.product);

    return [...subscriptionsWithProducts, ...ordersWithProducts];
  },
});

export const generateCustomerPortalUrl = action({
  args: {},
  handler: async (ctx) => {
    const user = await ctx.runQuery(api.users.current);

    if (!user || !user.email) {
      throw new Error("User not found or missing email");
    }

    const dbCustomer = await ctx.runQuery(
      components.polar.lib.getCustomerByUserId,
      { userId: user._id }
    );

    let customerId = dbCustomer?.id;

    if (!customerId) {
      // Create customer in Polar
      const customerResponse = await customersCreate(polar.polar, {
        email: user.email,
        metadata: {
          userId: user._id,
        },
      });

      if (customerResponse.ok) {
        customerId = customerResponse.value.id;
      } else {
        // If creation failed, check if customer already exists
        const listIter = await customersList(polar.polar, {
          email: user.email,
          limit: 1,
        });

        for await (const page of listIter) {
          if (page.ok && page.value.result.items.length > 0) {
            customerId = page.value.result.items[0].id;
            break;
          }
        }

        if (!customerId) {
          console.error("Polar customer creation failed:", customerResponse);
          throw new Error("Failed to create customer in Polar");
        }
      }

      // Store in Convex
      await ctx.runMutation(components.polar.lib.insertCustomer, {
        id: customerId!,
        userId: user._id,
      });
    }

    // Create Portal Session
    const sessionResponse = await customerSessionsCreate(polar.polar, {
      customerId: customerId!,
    });

    if (!sessionResponse.value) {
      console.error("Polar session creation failed:", sessionResponse);
      throw new Error("Failed to create portal session");
    }

    const session = sessionResponse.value;
    return { url: session.customerPortalUrl };
  },
});
