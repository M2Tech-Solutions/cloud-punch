import type { Data } from "../../action-type";
import { drizzle } from "@db/db";
import { eq, and } from "drizzle-orm";
import { worktimeTable } from "@db/schema";
import { getContext } from "@cf-action";
/**
 * Get the current user punch state
 */
export async function GET() {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const client = ctx.data.client;
  const meta = await client.getMetaData();

  const punchRecords = await db
    .select({
      punchIn: worktimeTable.punchIn,
      projectId: worktimeTable.project,
      taskId: worktimeTable.task,
    })
    .from(worktimeTable)
    .where(
      and(
        eq(worktimeTable.userId, meta.id!),
        eq(worktimeTable.status, "active"),
      ),
    )
    .get();

  return {
    success: true as const,
    record: punchRecords,
  };
}
