import { getContext } from "frame-master-plugin-cloudflare-pages-functions-action/context";
import { drizzle } from "@db/db";
import { and, eq } from "drizzle-orm";
import { worktimeTable, type WorktimeType } from "@db/schema";
import type { Data } from "../../action-type";

const mockWorkingHours: Array<WorktimeType> = [
  {
    id: 1,
    userId: "user1",
    userName: "John Doe",
    punchIn: new Date("2026-03-11T08:00:00Z").getTime(),
    punchOut: new Date("2026-03-11T16:00:00Z").getTime(),
    status: "pending",
    project: 1,
    task: 1,
    date: new Date("2026-03-11").getTime(),
  },
  {
    id: 2,
    userId: "user1",
    userName: "John Doe",
    punchIn: new Date("2026-03-12T08:00:00Z").getTime(),
    punchOut: new Date("2026-03-12T16:00:00Z").getTime(),
    status: "pending",
    project: 1,
    task: 1,
    date: new Date("2026-03-12").getTime(),
  },
  {
    id: 3,
    userId: "user2",
    userName: "Jane Smith",
    punchIn: new Date("2024-06-01T09:00:00Z").getTime(),
    punchOut: new Date("2024-06-01T17:00:00Z").getTime(),
    status: "pending",
    project: 1,
    task: 2,
    date: new Date("2024-06-01").getTime(),
  },
];

/**
 * Get all worktime records for all employees.
 */
export async function GET(filter?: { page: number; pageSize: number }) {
  const ctx = getContext<Env, any, Data>(arguments);
  const workingHours = await drizzle(ctx.env.DB)
    .select()
    .from(worktimeTable)
    .limit(filter ? filter.pageSize : 100)
    .offset(filter ? (filter.page - 1) * filter.pageSize : 0)
    .all();

  return {
    workingHours: workingHours as WorktimeType[],
    success: true,
  };
}

/**
 * Create new worktime record for an employee.
 */
export async function POST(
  newWh: Omit<WorktimeType, "id" | "userId" | "userName">,
) {
  const ctx = getContext<Env, any, Data>(arguments);
  const client = ctx.data.client;
  const session = await client.getUserSession("public");

  const { userId, id, userName, ...authorized } = newWh as WorktimeType;

  if (!client.userMeta.user_id || session instanceof Error) {
    return {
      success: false,
      error: session instanceof Error ? session.message : "Unauthorized",
    };
  }

  const result = (
    await drizzle(ctx.env.DB)
      .insert(worktimeTable)
      .values({
        ...authorized,
        userId: client.userMeta.user_id!,
        userName: session.public.name || "nom inconnu",
      })
      .returning()
  ).at(0);

  return {
    success: Boolean(result),
    worktime: result,
    error: result ? undefined : "Failed to create worktime record",
  };
}

/**
 * Update an existing worktime record for the loggedIn employee.
 */
export async function PUT({ action }: { action: "punch-in" | "punch-out" }) {
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

  const isCurrenltyPunched = () =>
    db
      .select()
      .from(worktimeTable)
      .where(
        and(
          eq(worktimeTable.userId, client.userMeta.user_id!),
          eq(worktimeTable.status, "active"),
        ),
      )
      .get()
      .then(Boolean);

  if (action === "punch-in") {
    if (!(await isCurrenltyPunched())) {
      return {
        success: false,
        error: "You are already punched in",
      };
    }

    await db
      .insert(worktimeTable)
      .values({
        userId: client.userMeta.user_id!,
        userName: session.public.name || "nom inconnu",
        punchIn: Date.now(),
        date: Date.now(),
        status: "active",
      })
      .run();

    return {
      success: true,
    };
  } else if (action === "punch-out") {
    if (!(await isCurrenltyPunched())) {
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
}
