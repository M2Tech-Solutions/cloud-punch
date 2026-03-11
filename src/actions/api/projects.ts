import { getContext } from "@cf-action";
import type { Data } from "../../action-type";
import { drizzle } from "@db/db";
import { projectTable } from "@db/schema";

/**
 * Get all project lists
 */
export async function GET() {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const result = await db.select().from(projectTable).all();
  return result;
}
