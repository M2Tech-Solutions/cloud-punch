import { getContext } from "@cf-action";
import { projectTable } from "@db/schema";
import type { Data } from "../../../action-type";
import { drizzle } from "@db/db";
import { eq } from "drizzle-orm";
/**
 * get project by ID
 */
export async function GET(id: number) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db
    .select()
    .from(projectTable)
    .where(eq(projectTable.id, id))
    .get();
  return result;
}

/**
 * create a new project
 */
export async function POST(project: typeof projectTable.$inferInsert) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db.insert(projectTable).values(project).returning();
  return result.at(0)!;
}

/**
 * update project by ID
 */
export async function PUT(
  id: string,
  project: Partial<typeof projectTable.$inferInsert>,
) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db
    .update(projectTable)
    .set(project)
    .where(eq(projectTable.id, Number(id)))
    .returning()
    .get();
  return result;
}
