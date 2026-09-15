const $ = (selector) => document.querySelector(selector);
const notice = $('#notice');

function escapeHtml(value = '') {
  return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' })[char]);
}

function render(data) {
  $('#newsCount').textContent = data.news.length;
  $('#reviewCount').textContent = data.drafts.filter((draft) => draft.status === 'review').length;
  $('#approvedCount').textContent = data.drafts.filter((draft) => draft.status === 'approved').length;
  $('#feedCount').textContent = data.feeds;
  $('#publishState').textContent = data.publishEnabled ? 'publicação ativa' : 'revisão ativa';
  $('#newsList').innerHTML = data.news.length ? data.news.map((news, index) => `<article class="news-card"><div class="card-index">${String(index + 1).padStart(2, '0')}</div><div><span class="tag ${news.topic === 'SST' ? 'sst' : ''}">${escapeHtml(news.topic)}</span><h3><a href="${escapeHtml(news.url)}" target="_blank" rel="noreferrer">${escapeHtml(news.title)}</a></h3><p>${escapeHtml(news.summary.replace(/<[^>]+>/g, '').slice(0, 190))}</p><div class="source">${escapeHtml(news.source)}</div></div></article>`).join('') : '<div class="empty">Nenhuma notícia capturada ainda. Comece buscando novidades.</div>';
  $('#draftList').innerHTML = data.drafts.length ? data.drafts.map((draft) => `<article class="draft-card"><div class="post-visual"><img src="${escapeHtml(draft.imageUrl || '')}" alt="Imagem ilustrativa para ${escapeHtml(draft.title)}" onerror="this.classList.add('broken')"><span>imagem ilustrativa · Unsplash</span></div><span class="tag ${draft.status === 'approved' ? '' : 'sst'}">${escapeHtml(draft.status === 'review' ? 'em revisão' : draft.status)}</span><h3>${escapeHtml(draft.title)}</h3><textarea id="caption-${draft.id}">${escapeHtml(draft.caption)}</textarea>${draft.status === 'review' ? `<input id="image-${draft.id}" type="url" value="${escapeHtml(draft.imageUrl || '')}" placeholder="URL pública da imagem (obrigatória)"><div class="draft-footer"><span class="status">rascunho ${draft.id}</span><button class="approve" data-approve="${draft.id}">Aprovar →</button></div>` : draft.status === 'approved' ? `<div class="draft-footer"><label class="select-draft"><input type="radio" name="selectedDraft" value="${draft.id}"> selecionar para publicar</label><span class="status approved">aprovado · ${draft.id}</span></div>` : `<div class="draft-footer"><span class="status approved">publicado</span><span class="status">rascunho ${draft.id}</span></div>`}</article>`).join('') : '<div class="empty">Os rascunhos preparados aparecerão aqui.</div>';
  document.querySelectorAll('[data-approve]').forEach((button) => button.addEventListener('click', () => approve(button.dataset.approve)));
}

async function refresh() {
  const response = await fetch('/api/state');
  render(await response.json());
}

async function runAction(endpoint, payload = {}) {
  notice.textContent = 'Processando...';
  const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error);
  notice.textContent = result.message;
  render(result.state);
}

async function approve(id) {
  try { await runAction('/api/approve', { id, imageUrl: $(`#image-${id}`).value }); } catch (error) { notice.textContent = error.message; }
}

document.querySelectorAll('[data-action]').forEach((button) => button.addEventListener('click', async () => {
  try {
    const payload = button.dataset.action === 'publish' ? { id: document.querySelector('input[name="selectedDraft"]:checked')?.value } : {};
    await runAction(`/api/${button.dataset.action}`, payload);
  } catch (error) { notice.textContent = error.message; }
}));
$('#refresh').addEventListener('click', refresh);
refresh().catch((error) => { notice.textContent = error.message; });
