import { getContext } from "@cf-action";
import { taskTable } from "@db/schema";
import type { Data } from "../../action-type";
import { drizzle } from "@db/db";
import { eq } from "drizzle-orm";

/**
 * Get tasks by project ID
 */
export async function GET(projectId: number) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  return db
    .select()
    .from(taskTable)
    .where(eq(taskTable.projectId, projectId))
    .all();
}
