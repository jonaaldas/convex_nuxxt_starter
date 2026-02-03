import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Cached subscription status from Polar (updated via webhooks)
  userSubscriptions: defineTable({
    email: v.string(),
    polarCustomerId: v.optional(v.string()),
    isPaid: v.boolean(),
    isLaunchPrice: v.optional(v.boolean()),
    updatedAt: v.number(),
  }).index("by_email", ["email"]),
});
