import { ConsoleLogWriter } from "drizzle-orm";
import { XMLParser } from "fast-xml-parser";

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