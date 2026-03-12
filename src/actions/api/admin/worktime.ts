import { getContext } from "@cf-action";
import { worktimeTable, type WorktimeType } from "@db/schema";
import type { Data } from "../../../action-type";
import { drizzle } from "@db/db";
import { desc, eq } from "drizzle-orm";

/**
 * Get all worktime entries, newest first (admin).
 */
export async function GET(
  filter?: Partial<{ page: number; pageSize: number }>,
) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  return db
    .select()
    .from(worktimeTable)
    .orderBy(desc(worktimeTable.date))
    .limit(filter?.pageSize ?? 100)
    .offset(filter?.page ? (filter.page - 1) * (filter.pageSize ?? 100) : 0)
    .all() as Promise<WorktimeType[]>;
}

/**
 * Create a worktime entry for a specific user (admin).
 */
export async function POST(entry: Omit<WorktimeType, "id">) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db.insert(worktimeTable).values(entry).returning();
  return result.at(0)!;
}

/**
 * Update a worktime entry by ID (admin).
 */
export async function PUT(
  id: number,
  patch: Partial<Omit<WorktimeType, "id">>,
) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db
    .update(worktimeTable)
    .set(patch)
    .where(eq(worktimeTable.id, id))
    .returning()
    .get();
  return result;
}

/**
 * Delete a worktime entry by ID (admin).
 */
export async function DELETE(id: number) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  await db.delete(worktimeTable).where(eq(worktimeTable.id, id));
  return { success: true };
}
