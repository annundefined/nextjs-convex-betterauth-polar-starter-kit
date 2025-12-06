/**
 * Users Module
 *
 * Provides queries to access the current authenticated user.
 * User data is managed by Better Auth and stored in the betterAuth component.
 *
 * Usage:
 *   const user = useQuery(api.users.current);
 */

import { query, QueryCtx } from "./_generated/server";
import { authComponent } from "./auth";

export const current = query({
  args: {},
  handler: async (ctx) => {
    return await getCurrentUser(ctx);
  },
});

export async function getCurrentUserOrThrow(ctx: QueryCtx) {
  const userRecord = await getCurrentUser(ctx);
  if (!userRecord) throw new Error("Can't get current user");
  return userRecord;
}

export async function getCurrentUser(ctx: QueryCtx) {
  const user = await authComponent.safeGetAuthUser(ctx);
  return user ?? null;
}
