export function classify(title, summary) {
  const text = `${title} ${summary}`.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const sstTerms = ['seguranca do trabalho', 'saude ocupacional', 'ergonomia', 'acidente', 'e-social', 'esocial', 'nr-'];
  return sstTerms.some((term) => text.includes(term)) ? 'SST' : 'RH';
}

function clean(value) {
  return value.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
}

export function buildCaption(title, summary, source, url, topic) {
  let text = clean(summary);
  if (text.length > 380) text = `${text.slice(0, 377).trimEnd()}...`;
  const hashtags = topic === 'RH' ? '#RH #RecursosHumanos #GestaoDePessoas' : '#SST #SegurancaDoTrabalho #SaudeOcupacional';
  return `${title}\n\n${text}\n\nO que isso muda na pratica para profissionais e empresas? Compartilhe sua visao nos comentarios.\n\nFonte: ${source}\n${url}\n\n${hashtags}`;
}

export function illustrationFor(topic, title = '') {
  const text = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const photos = text.includes('mental') || text.includes('saude')
    ? 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=1080&q=85'
    : text.includes('ergonomia') || text.includes('acidente')
      ? 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1080&q=85'
      : text.includes('lideranca') || text.includes('gestao') || text.includes('carreira')
        ? 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1080&q=85'
        : topic === 'SST'
          ? 'https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=1080&q=85'
          : 'https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1080&q=85';
  return photos;
}
