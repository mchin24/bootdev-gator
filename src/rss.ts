import { XMLParser } from "fast-xml-parser";
import { UUID } from "node:crypto";
import { Feed, User } from "./db/schema.js";
import { createFeed, getFeeds } from "./db/queries/feeds.js";

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


export async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
    try {
        const feeds = await getFeeds();
        for(const { name, url, username} of feeds) {
            console.log(`Feed ${name}: ${url} - added by ${username}`);
        }
    } catch (error: any) {
        throw new Error(`Failed to retrieve RSS Feeds: ${error.message}`);
    }
}