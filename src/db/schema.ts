import {
  pgTable,
  pgEnum,
  uuid,
  serial,
  integer,
  text,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const userRole = pgEnum("user_role", ["user", "admin"]);

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull(),
  usernameChanges: integer("username_changes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  role: userRole("role").default("user").notNull(),
});

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content"),
  published: boolean("published").default(false).notNull(),
  authorId: uuid("author_id").references(() => profiles.id, { onDelete: "cascade" }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const profilesRelations = relations(profiles, ({ many }) => ({
  posts: many(posts),
  pins: many(pins),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(profiles, {
    fields: [posts.authorId],
    references: [profiles.id],
  }),
}));

export const pins = pgTable("pins", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  imagePath: text("image_path").notNull(),
  authorId: uuid("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  categoryId: uuid("category_id")
    .references(() => categories.id, { onDelete: "restrict" })
    .notNull(),
});

export const pinsRelations = relations(pins, ({ one }) => ({
  author: one(profiles, {
    fields: [pins.authorId],
    references: [profiles.id],
  }),
}));

export const categories = pgTable("categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});