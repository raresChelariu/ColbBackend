const xml = require("xml");

class RSSHelper {
    static GenerateRSSFromBottles(posts)  {
        const RSS_URL = `http://localhost:3000/bottles/last5/`;
        function buildFeed(
            posts
        ) {
            const sortedPosts = posts.sort(function (first, second) {
                return new Date(second.date).getTime() - new Date(first.date).getTime();
            });

            const feedItems = [];

            feedItems.push(
                ...sortedPosts.map(function (rssBottle) {
                    return {
                        item: [
                            {title: rssBottle.Name},
                            {
                                pubDate: new Date(rssBottle.InputDateTime).toUTCString(),
                            },
                            {
                                guid: [
                                    {_attr: {isPermaLink: true}},
                                    RSS_URL,
                                ],
                            },
                            {
                                description: {
                                    _cdata: `Bottle Name: ${rssBottle.Name}; Bottle label: ${rssBottle.Label}; Bottle CreationDate: ${rssBottle.CreatedDateTime}`,
                                },
                            },
                        ],
                    };
                })
            );

            return feedItems;
        }
        const feedObject = {
            rss: [
                {
                    _attr: {
                        version: "2.0",
                        "xmlns:atom": "http://www.w3.org/2005/Atom",
                    },
                },
                {
                    channel: [
                        {
                            "atom:link": {
                                _attr: {
                                    href: RSS_URL,
                                    rel: "self",
                                    type: "application/rss+xml",
                                },
                            },
                        },
                        {
                            title: "CLOB - Last 5 bottles added",
                        },
                        {
                            link: RSS_URL,
                        },
                        {
                            description: "Collecting bottles on the web"
                        },
                        {
                            language: "en-US"
                        },
                        ...buildFeed(posts),
                    ],
                },
            ],
        };

        return `<?xml version="1.0" encoding="UTF-8"?>${xml(feedObject)}`;
    }
}

module.exports = RSSHelper;