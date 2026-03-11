import { getContext } from "@cf-action";
import { taskTable } from "@db/schema";
import type { Data } from "../../../action-type";
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

/**
 * Create a new task
 */
export async function POST(task: typeof taskTable.$inferInsert) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db.insert(taskTable).values(task).returning();
  return result.at(0)!;
}

/**
 * Update a task by ID
 */
export async function PUT(
  id: number,
  task: Partial<typeof taskTable.$inferInsert>,
) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db
    .update(taskTable)
    .set(task)
    .where(eq(taskTable.id, id))
    .returning()
    .get();
  return result;
}

/**
 * Delete a task by ID
 */
export async function DELETE(id: number) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  await db.delete(taskTable).where(eq(taskTable.id, id));
  return { success: true };
}
