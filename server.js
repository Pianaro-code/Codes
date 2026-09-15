import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { settings } from './src/config.js';
import { buildCaption, illustrationFor } from './src/content.js';
import { Database } from './src/db.js';
import { collect } from './src/feeds.js';
import { publishDraft } from './src/instagram.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(root, 'web');
const config = settings();
const database = new Database(config.databasePath);
database.ensureDraftImages((topic, title) => illustrationFor(topic, title));
const port = Number(process.env.PORT || 3000);

function json(response, status, body) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  response.end(JSON.stringify(body));
}

function state() {
  return {
    news: database.data.news.slice(-12).reverse(),
    drafts: database.data.drafts.slice().reverse(),
    publishEnabled: config.publishEnabled,
    feeds: config.rssFeeds.length,
  };
}

async function body(request) {
  let value = '';
  for await (const chunk of request) value += chunk;
  return value ? JSON.parse(value) : {};
}

async function action(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/state') return json(response, 200, state());
  if (request.method !== 'POST') return json(response, 405, { error: 'Metodo nao permitido.' });

  try {
    if (pathname === '/api/collect') {
      const items = await collect(config.rssFeeds);
      const added = items.filter((item) => database.addNews(item)).length;
      return json(response, 200, { message: `${added} novas noticias encontradas.`, state: state() });
    }
    if (pathname === '/api/draft') {
      let created = 0;
      for (const news of database.newsWithoutDrafts(10)) {
        const id = database.addDraft(news.id, news.title, buildCaption(news.title, news.summary, news.source, news.url, news.topic), news.url, illustrationFor(news.topic, news.title));
        if (id) created += 1;
      }
      return json(response, 200, { message: `${created} rascunhos preparados.`, state: state() });
    }
    if (pathname === '/api/approve') {
      const input = await body(request);
      database.approveDraft(Number(input.id), input.imageUrl);
      return json(response, 200, { message: 'Rascunho aprovado.', state: state() });
    }
    if (pathname === '/api/publish') {
      if (!config.publishEnabled) throw new Error('Publicacao desativada. Configure PUBLISH_ENABLED=true.');
      const input = await body(request);
      const draft = database.approvedDraft(Number(input.id));
      if (!draft) throw new Error('Selecione um rascunho aprovado para publicar.');
      const mediaId = await publishDraft(draft, config);
      database.markPublished(draft.id, mediaId);
      return json(response, 200, { message: `Rascunho ${draft.id} publicado.`, state: state() });
    }
    return json(response, 404, { error: 'Rota nao encontrada.' });
  } catch (error) {
    return json(response, 400, { error: error.message });
  }
}

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  if (url.pathname.startsWith('/api/')) return action(request, response, url.pathname);
  const filePath = url.pathname === '/' ? path.join(publicDir, 'index.html') : path.join(publicDir, url.pathname);
  if (!filePath.startsWith(publicDir) || !fs.existsSync(filePath)) return response.writeHead(404).end('Not found');
  const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8' };
  response.writeHead(200, { 'Content-Type': types[path.extname(filePath)] || 'text/plain; charset=utf-8' });
  response.end(fs.readFileSync(filePath));
});

server.listen(port, () => console.log(`Bot RH/SST aberto em http://localhost:${port}`));
