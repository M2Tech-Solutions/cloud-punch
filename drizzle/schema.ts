import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export type WorktimeType = typeof worktimeTable.$inferSelect & {
  status: "pending" | "approved" | "rejected";
};
export const worktimeTable = sqliteTable("worktime", {
  id: integer().primaryKey({ autoIncrement: true }),
  userId: text().notNull(),
  date: text().notNull(),
  punchIn: integer({ mode: "timestamp_ms" }),
  punchOut: integer({ mode: "timestamp_ms" }),
  status: text().notNull(),
});

export type ProjectType = typeof projectTable.$inferSelect;
export const projectTable = sqliteTable("project", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  createdAt: integer({ mode: "timestamp_ms" }),
  status: text().notNull(),
});

export type TaskType = typeof taskTable.$inferSelect & {
  status: "pending" | "in_progress" | "completed";
};
export const taskTable = sqliteTable("tasks", {
  id: integer().primaryKey({ autoIncrement: true }),
  projectId: integer().references(() => projectTable.id),
  name: text().notNull(),
  description: text(),
  deadLine: integer({ mode: "timestamp_ms" }),
  createdAt: integer({ mode: "timestamp_ms" }),
  status: text().notNull(),
});
