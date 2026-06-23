import { drizzle } from "drizzle-orm/d1";
import { sqliteTable, text, integer, blob } from "drizzle-orm/sqlite-core";

export const posts = sqliteTable("posts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  description: text("description"),
  date: integer("date", { mode: "timestamp" }).notNull(),
  tags: text("tags", { mode: "json" }),
  author: text("author"),
  readingTime: integer("reading_time"),
  content: text("content").notNull(),
  draft: integer("draft", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});

export const comments = sqliteTable("comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  postSlug: text("post_slug").notNull(),
  author: text("author").notNull(),
  text: text("text").notNull(),
  approved: integer("approved", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
});

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "editor", "viewer"] }).default("viewer"),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});

export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type User = typeof users.$inferSelect;

export type Db = ReturnType<typeof drizzle>;
