import { db } from "../index.js";
import { feeds, users } from "../schema.js"
import { eq } from "drizzle-orm"

export async function createFeed(name: string, url: string, user_id: string) {
    const [result] = await db.insert(feeds).values({
        name: name,
        url: url,
        user_id: user_id
    }).returning();
    return result;
}

export async function getFeeds() {
    const result = await db.select({name: feeds.name, url: feeds.url, username: users.name })
        .from(feeds).leftJoin(users, eq(feeds.user_id, users.id));
    return result;
}