import { internalMutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Update or create subscription status for a user (called from webhooks)
 */
export const syncSubscriptionStatus = internalMutation({
  args: {
    email: v.string(),
    polarCustomerId: v.optional(v.string()),
    isPaid: v.boolean(),
    isLaunchPrice: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        polarCustomerId: args.polarCustomerId,
        isPaid: args.isPaid,
        isLaunchPrice: args.isLaunchPrice ?? false,
        updatedAt: Date.now(),
      });
    } else {
      await ctx.db.insert("userSubscriptions", {
        email: args.email,
        polarCustomerId: args.polarCustomerId,
        isPaid: args.isPaid,
        isLaunchPrice: args.isLaunchPrice ?? false,
        updatedAt: Date.now(),
      });
    }
  },
});

/**
 * Get subscription status for a user by email (for internal use)
 */
export const getSubscriptionStatus = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const subscription = await ctx.db
      .query("userSubscriptions")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .first();

    return subscription?.isPaid ?? false;
  },
});
