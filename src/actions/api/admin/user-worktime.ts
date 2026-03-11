import { getContext } from "@cf-action";
import { drizzle } from "@db/db";
import { worktimeTable } from "@db/schema";
import { eq } from "drizzle-orm";
import type { Data } from "../../../action-type";

export async function GET(userId: string) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);

  const privateSession = await ctx.data.client.getUserSession("private");

  if (
    privateSession instanceof Error ||
    privateSession.private?.role !== "admin"
  ) {
    return { error: "Unauthorized" };
  }

  const worktimes = await db
    .select()
    .from(worktimeTable)
    .where(eq(worktimeTable.userId, userId))
    .all();

  return { success: true, worktimes };
}
