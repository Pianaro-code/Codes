import { classify } from './content.js';

function decodeXml(value = '') {
  return value.replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#39;/g, "'").replace(/&quot;/g, '"');
}

function tagValue(block, tag) {
  const match = block.match(new RegExp(`<${tag}(?:\\s[^>]*)?>([\\s\\S]*?)</${tag}>`, 'i'));
  return decodeXml(match?.[1] || '').trim();
}

export async function collect(feedUrls) {
  const items = [];
  for (const feedUrl of feedUrls) {
    const response = await fetch(feedUrl);
    if (!response.ok) throw new Error(`Falha ao buscar ${feedUrl}: HTTP ${response.status}`);
    const xml = await response.text();
    const source = tagValue(xml.match(/<channel[\s\S]*?<\/channel>/i)?.[0] || xml, 'title') || new URL(feedUrl).hostname;
    for (const block of xml.match(/<item[\s\S]*?<\/item>/gi) || []) {
      const title = tagValue(block, 'title');
      const url = tagValue(block, 'link');
      if (!title || !url) continue;
      const summary = tagValue(block, 'description');
      items.push({ title, url, summary, source, publishedAt: tagValue(block, 'pubDate'), topic: classify(title, summary) });
    }
  }
  return items;
}
