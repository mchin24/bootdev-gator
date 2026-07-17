import { pgTable, timestamp, uuid, text, unique } from "drizzle-orm/pg-core";

export type User = typeof users.$inferSelect;
export type Feed = typeof feeds.$inferSelect;
export type FeedFollow = typeof feed_follows.$inferSelect;

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
    .$onUpdate(() => new Date()),
    name: text("name").unique().notNull()
});

export const feeds = pgTable("feeds", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow()
        .$onUpdate(() => new Date()),
    name: text().notNull(),
    url: text().unique().notNull(),
    user_id: uuid().references(() => users.id, {onDelete: 'cascade'})
});

export const feed_follows = pgTable("feed_follows", {
    id: uuid("id").primaryKey().defaultRandom().notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
    user_id: uuid().references(() => users.id, {onDelete: 'cascade'}),
    feed_id: uuid().references(() => feeds.id, {onDelete: 'cascade'})
}, (t) => [
    unique().on(t.user_id, t.feed_id)
]);