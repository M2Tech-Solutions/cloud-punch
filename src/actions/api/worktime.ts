import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { drizzle } from "@db/db";
import { and, eq } from "drizzle-orm";
import { worktimeTable, type WorktimeType } from "@db/schema";
import type { Data } from "../../action-type";
/**
 * Get worktime records for the currently logged-in user.
 */
export async function GET() {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);
  const client = ctx.data.client;
  await client.getUserSession("public");

  const workingHours = await db
    .select()
    .from(worktimeTable)
    .where(eq(worktimeTable.userId, client.userMeta.user_id!))
    .all();

  return {
    success: true as const,
    workingHours: workingHours as WorktimeType[],
  };
}

/**
 * Update an existing worktime record for the loggedIn employee.
 */
export async function PUT({
  action,
  payload,
}: {
  action: "punch-in" | "punch-out";
  payload: Partial<WorktimeType>;
}) {
  const ctx = getContext<Env, any, Data>(arguments);
  const db = drizzle(ctx.env.DB);

  const client = ctx.data.client;
  const session = await client.getUserSession("public");

  if (!client.userMeta.user_id || session instanceof Error) {
    return {
      success: false,
      error: session instanceof Error ? session.message : "Unauthorized",
    };
  }

  const getPunch = () =>
    db
      .select()
      .from(worktimeTable)
      .where(
        and(
          eq(worktimeTable.userId, client.userMeta.user_id!),
          eq(worktimeTable.status, "active"),
        ),
      )
      .get();

  const isCurrenltyPunched = () => getPunch().then(Boolean);

  if (action === "punch-in") {
    if (await isCurrenltyPunched()) {
      return {
        success: false,
        error: "You are already punched in",
      };
    }

    const { task, ..._payload } = payload;

    await db
      .insert(worktimeTable)
      .values({
        ..._payload,
        task: task == -1 ? undefined : task,
        userId: client.userMeta.user_id!,
        userName: session.public.name ?? session.user_identifier,
        punchIn: Date.now(),
        date: Date.now(),
        status: "active",
      })
      .run();

    return {
      success: true,
    };
  } else if (action === "punch-out") {
    const punch = await getPunch();
    if (!punch || !punch.punchIn) {
      return {
        success: false,
        error: "You are not punched in",
      };
    }

    await db
      .update(worktimeTable)
      .set({
        punchOut: Date.now(),
        status: "pending",
      })
      .where(
        and(
          eq(worktimeTable.userId, client.userMeta.user_id!),
          eq(worktimeTable.status, "active"),
        ),
      )
      .run();

    return {
      success: true,
    };
  }

  return {
    success: false,
    error: "Invalid request",
  };
}
