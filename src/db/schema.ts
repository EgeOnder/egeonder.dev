import type { InferModel } from "drizzle-orm";
import { pgTable, serial, text, varchar } from "drizzle-orm/pg-core";

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 32 }).notNull(),
  description: text("description").notNull(),
  href: varchar("href", { length: 128 }).notNull(),
});

export type Project = InferModel<typeof projects, "select">;
export type NewProject = InferModel<typeof projects, "insert">;
