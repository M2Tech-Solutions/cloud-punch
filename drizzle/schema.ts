import { sqliteTable, integer, real, text } from "drizzle-orm/sqlite-core";

export type ProjectType = typeof projectTable.$inferSelect;
export const projectTable = sqliteTable("project", {
  id: integer().primaryKey({ autoIncrement: true }),
  name: text().notNull(),
  description: text(),
  createdAt: integer(),
});

export type TaskType = typeof taskTable.$inferSelect & {
  status: "pending" | "in_progress" | "completed";
};
export const taskTable = sqliteTable("tasks", {
  id: integer().primaryKey({ autoIncrement: true }),
  projectId: integer().references(() => projectTable.id),
  name: text().notNull(),
  description: text(),
  deadLine: integer(),
  createdAt: integer(),
  status: text().notNull(),
});

export type WorktimeType = typeof worktimeTable.$inferSelect & {
  status: "pending" | "approved" | "rejected" | "fulfilled" | "active";
};
export const worktimeTable = sqliteTable("worktime", {
  id: integer().primaryKey({ autoIncrement: true }),
  userName: text().notNull(),
  userId: text().notNull(),
  date: integer().notNull(),
  punchIn: integer(),
  punchOut: integer(),
  project: integer().references(() => projectTable.id),
  task: integer().references(() => taskTable.id),
  status: text().notNull(),
});
