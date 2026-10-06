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

export const profiles = pgTable("profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: text("username").notNull(),
  usernameChanges: integer("username_changes").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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

export const pinCategory = pgEnum("pin_category", [
  "tatuajes",
  "paisajes",
  "dibujos",
  "ropa",
]);

export const pins = pgTable("pins", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  imagePath: text("image_path").notNull(),
  category: pinCategory("category").notNull(),
  authorId: uuid("author_id")
    .references(() => profiles.id, { onDelete: "cascade" })
    .notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const pinsRelations = relations(pins, ({ one }) => ({
  author: one(profiles, {
    fields: [pins.authorId],
    references: [profiles.id],
  }),
}));