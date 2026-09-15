import { settings } from './config.js';
import { buildCaption, illustrationFor } from './content.js';
import { Database } from './db.js';
import { collect } from './feeds.js';
import { publishDraft } from './instagram.js';

function usage() {
  console.log('Uso: node src/index.js <collect|draft|approve|publish> [opcoes]');
}

async function main() {
  const [command, ...args] = process.argv.slice(2);
  if (!command) return usage();
  const config = settings();
  const database = new Database(config.databasePath);
  database.ensureDraftImages(illustrationFor);

  if (command === 'collect') {
    const items = await collect(config.rssFeeds);
    const added = items.filter((item) => database.addNews(item)).length;
    console.log(`Coleta concluida: ${added} novas noticias de ${items.length} encontradas.`);
    return;
  }
  if (command === 'draft') {
    for (const news of database.newsWithoutDrafts(10)) {
      const id = database.addDraft(news.id, news.title, buildCaption(news.title, news.summary, news.source, news.url, news.topic), news.url, illustrationFor(news.topic, news.title));
      if (id) console.log(`Rascunho ${id} criado: ${news.title}`);
    }
    return;
  }
  if (command === 'approve') {
    const id = Number(args[0]);
    const imageUrl = args[1];
    database.approveDraft(id, imageUrl);
    console.log(`Rascunho ${id} aprovado.`);
    return;
  }
  if (command === 'publish') {
    if (!config.publishEnabled) throw new Error('Publicacao desativada. Defina PUBLISH_ENABLED=true depois de revisar os rascunhos.');
    const id = Number(args[0]);
    const draft = database.approvedDraft(id);
    if (!draft) throw new Error('Informe o ID de um rascunho aprovado.');
    const mediaId = await publishDraft(draft, config);
    database.markPublished(draft.id, mediaId);
    console.log(`Rascunho ${draft.id} publicado: ${mediaId}`);
    return;
  }
  usage();
}

main().catch((error) => {
  console.error(`Erro: ${error.message}`);
  process.exitCode = 1;
});
