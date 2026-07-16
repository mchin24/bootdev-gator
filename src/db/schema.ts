import { integer } from "drizzle-orm/gel-core";
import { pgTable, timestamp, uuid, text } from "drizzle-orm/pg-core";

export type User = typeof users.$inferSelect;
export type Feed = typeof feeds.$inferSelect;

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