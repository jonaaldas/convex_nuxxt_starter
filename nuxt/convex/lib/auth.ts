import type { QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";

export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) throw new Error("Unauthorized");
  return user;
}
