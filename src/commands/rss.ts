import { XMLParser } from "fast-xml-parser";
import { Feed, User } from "../db/schema.js";
import { createFeed, createFeedFollows, getFeeds, getFeedByURL, getFeedFollowsForUser } from "../db/queries/feeds.js";
import { readConfig } from "../config.js";
import { getUserByName } from "../db/queries/users.js";

type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
    if(args.length < 1) {
        throw new Error(`Missing argument: url is required.`);
    }
    const url = args[0];
    const feed = await fetchFeed(url);
    console.log(JSON.stringify(feed));
}

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
    try {
        const response = await fetch(feedURL, {
            method: 'GET',
            headers: {
                'User-Agent': 'gator',
            },
        });

        const xmlParser = new XMLParser({ processEntities: false });
        const xmlData = xmlParser.parse(await response.text());
        if(!xmlData || !xmlData.rss || !xmlData.rss.channel) {
            throw new Error(`Invalid RSS feed format`);
        }

        const channel = xmlData.rss.channel;
        if(!channel.title || !channel.link || !channel.description) {
            throw new Error(`Missing required channel fields in RSS feed`);
        }
        const { title, link, description } = channel;

        let items: RSSItem[] = [];
        if(channel.item && Array.isArray(channel.item)) {
            for(const item of channel.item) {
                if(!item.title || !item.link || !item.description || !item.pubDate) {
                    continue
                }
                const rssItem: RSSItem = { 
                    title: item.title,
                    link: item.link,
                    description: item.description,
                    pubDate: item.pubDate,
                  };
                items.push(rssItem);
            }
        }
        console.log(items);
        const rssFeed: RSSFeed = { channel: { title, link, description, item: items}};
        return rssFeed;
    } catch (error: any) {
        throw new Error(`Failed to fetch RSS feed: ${error.message}`);
    }
}

export async function addFeed(name: string, url: string, user_id: string): Promise<Feed> {
    try {
        const feed: Feed = await createFeed(name, url, user_id);
        return feed;
    } catch (error: any) {
        throw new Error(`Failed to add RSS feed: ${error.message}`);
    }
}

export function printFeed(feed: Feed, user: User): void {
    console.log(`User: ${JSON.stringify(user)}`);
    console.log(`Feed: ${JSON.stringify(feed)}`);
}

export async function handlerAddFeed(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if(args.length < 1) throw new Error('Missing arguments: name and url are required.');
    if(args.length < 2) throw new Error('Missing argument: url is required.');
    const name: string = args[0];
    const url: string = args[1];

    const feed = await addFeed(name, url, user.id);
    const follow = await createFeedFollows(user.id, feed.id);
    printFeed(feed, user);
}


export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
    try {
        const feeds = await getFeeds();
        for(const { name, url, user_name} of feeds) {
            console.log(`Feed ${name}: ${url} - added by ${user_name}`)
        }
    } catch (error: any) {
        throw new Error(`Failed to retrieve RSS Feeds: ${error.message}`);
    }
}

export async function handlerFollow(cmdName: string, user: User, ...args: string[]): Promise<void> {
    if(args.length < 1) {
        throw new Error('Missing argument: expected url');
    }
    const url: string = args[0];
    const feed: Feed = await getFeedByURL(url);
    if(!feed) {
        throw new Error(`Feed cannot be found for ${url}`);
    }

    try {
        const follow = await createFeedFollows(user.id, feed.id);
        console.log(`${user.name} is now following ${feed.url}`);

    } catch (error: any) {
        throw new Error(`Failed creating follow of ${feed.url} for user ${user.name}.`);
    }

}

export async function handlerFollowing(cmdName: string, user: User, ...args: string[]): Promise<void> {
    const follows = await getFeedFollowsForUser(user.id);
    for(const { feed_name } of follows) {
        console.log(`${feed_name}`);
    }
}