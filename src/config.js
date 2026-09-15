import fs from 'node:fs';
import path from 'node:path';

function loadEnv() {
  const envPath = path.resolve('.env');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match && !process.env[match[1]]) process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
  }
}

loadEnv();

export function settings() {
  const defaultFeeds = [
    'https://news.google.com/rss/search?q=recursos+humanos&hl=pt-BR&gl=BR&ceid=BR:pt-419',
    'https://news.google.com/rss/search?q=seguranca+do+trabalho&hl=pt-BR&gl=BR&ceid=BR:pt-419',
  ];
  return {
    databasePath: path.resolve(process.env.DATABASE_PATH || 'data/rhbot.json'),
    publishEnabled: process.env.PUBLISH_ENABLED === 'true',
    instagramAccountId: process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || '',
    instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
    instagramApiVersion: process.env.INSTAGRAM_API_VERSION || 'v22.0',
    rssFeeds: (process.env.RSS_FEEDS || '').split(',').map((feed) => feed.trim()).filter(Boolean).length
      ? process.env.RSS_FEEDS.split(',').map((feed) => feed.trim()).filter(Boolean)
      : defaultFeeds,
  };
}
