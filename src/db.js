import fs from 'node:fs';
import path from 'node:path';

export class Database {
  constructor(filePath) {
    this.filePath = filePath;
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    this.data = fs.existsSync(filePath) ? JSON.parse(fs.readFileSync(filePath, 'utf8')) : { nextNewsId: 1, nextDraftId: 1, news: [], drafts: [] };
  }

  save() {
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2));
  }

  ensureDraftImages(imageFor) {
    const newsById = new Map(this.data.news.map((news) => [news.id, news]));
    let changed = false;
    for (const draft of this.data.drafts) {
      const news = newsById.get(draft.newsId);
      if (!draft.imageUrl && news) {
        draft.imageUrl = imageFor(news.topic, news.title);
        changed = true;
      }
    }
    if (changed) this.save();
  }

  addNews(item) {
    if (this.data.news.some((news) => news.url === item.url)) return false;
    this.data.news.push({ id: this.data.nextNewsId++, ...item });
    this.save();
    return true;
  }

  newsWithoutDrafts(limit = 10) {
    const draftedNews = new Set(this.data.drafts.map((draft) => draft.newsId));
    return this.data.news.filter((news) => !draftedNews.has(news.id)).slice(-limit).reverse();
  }

  addDraft(newsId, title, caption, sourceUrl, imageUrl = null) {
    if (this.data.drafts.some((draft) => draft.newsId === newsId)) return 0;
    const draft = { id: this.data.nextDraftId++, newsId, title, caption, sourceUrl, imageUrl, status: 'review' };
    this.data.drafts.push(draft);
    this.save();
    return draft.id;
  }

  approveDraft(id, imageUrl) {
    const draft = this.data.drafts.find((item) => item.id === id);
    if (!draft) throw new Error(`Rascunho ${id} nao encontrado.`);
    draft.status = 'approved';
    if (imageUrl) draft.imageUrl = imageUrl;
    this.save();
  }

  pendingDrafts(limit = 10) {
    return this.data.drafts.filter((draft) => draft.status === 'approved').slice(0, limit);
  }

  approvedDraft(id) {
    return this.data.drafts.find((draft) => draft.id === id && draft.status === 'approved');
  }

  markPublished(id, mediaId) {
    const draft = this.data.drafts.find((item) => item.id === id);
    draft.status = 'published';
    draft.instagramMediaId = mediaId;
    this.save();
  }
}
