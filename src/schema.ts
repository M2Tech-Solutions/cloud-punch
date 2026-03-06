// src/schema.ts
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const employees = sqliteTable("employees", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
});

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  name: text("name").notNull(),
  description: text("description"),
});

export const tasks = sqliteTable("tasks", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  projectId: integer("project_id").references(() => projects.id),
  name: text("name").notNull(),
});

export const timeLogs = sqliteTable("time_logs", {
  id: integer("id").primaryKey({
    autoIncrement: true,
  }),
  employeeId: integer("employee_id").references(() => employees.id),
  taskId: integer("task_id").references(() => tasks.id),
  startTime: integer("start_time").notNull(),
  endTime: integer("end_time"),
  durationMinutes: integer("duration_minutes"),
});
