import { db } from "../index.js";
import { feeds, users, feed_follows } from "../schema.js"
import { User, Feed, FeedFollow } from "../schema.js";
import { eq, getTableColumns } from "drizzle-orm"

export async function createFeed(name: string, url: string, user_id: string): Promise<Feed> {
    const [result] = await db.insert(feeds).values({
        name: name,
        url: url,
        user_id: user_id
    }).returning();
    return result;
}

export async function getFeeds() {
    const result = await db.select({name: feeds.name, url: feeds.url, user_name: users.name })
        .from(feeds).leftJoin(users, eq(feeds.user_id, users.id));
    return result;
}

export async function getFeedByURL(url: string): Promise<Feed> {
    const [feed] = await db.select().from(feeds).where(eq(feeds.url, url)).limit(1);
    return feed;
}

export async function createFeedFollows(user_id: string, feed_id: string)  {
    const [result] = await db.insert(feed_follows)
        .values({ user_id: user_id, feed_id: feed_id }).returning();
    const [feed_follow] = await db.select({...getTableColumns(feed_follows), user_name: users.name, feed_name: feeds.name})
        .from(feed_follows).innerJoin(users, eq(feed_follows.user_id, users.id))
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id));
    return feed_follow;
}

export async function getFeedFollowsForUser(user_id: string) {
    const follows = await db.select({
        ...getTableColumns(feed_follows),
        feed_name: feeds.name
        })
        .from(feed_follows)
        .innerJoin(feeds, eq(feed_follows.feed_id, feeds.id))
        .where(eq(feed_follows.user_id, user_id));
    return follows;
}