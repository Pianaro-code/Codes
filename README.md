# Bot Instagram RH e SST

Bot em JavaScript/Node.js para pesquisar noticias e novidades de Recursos Humanos (RH) e Saude e Seguranca do Trabalho (SST), preparar legendas e publicar no Instagram.

## Fluxo

1. Copie `.env.example` para `.env` e ajuste os feeds RSS.
2. Abra o painel web: `node server.js`
3. Acesse `http://localhost:3000` no navegador.
4. Use os botoes para buscar noticias, preparar rascunhos e aprovar posts.
5. Configure `PUBLISH_ENABLED=true` e as credenciais do Instagram antes de publicar.

Tambem e possivel usar o CLI: `node src/index.js collect`, `node src/index.js draft`, `node src/index.js approve ID URL_DA_IMAGEM` e `node src/index.js publish ID_DO_RASCUNHO`.

Os dados ficam em `data/rhbot.json` por padrão. A publicação é desativada por padrão para evitar postagem automática sem revisão.

## Instagram

A integração usa a Instagram Graph API. É necessário usar uma conta profissional (Business ou Creator), ligada a uma Página do Facebook, com um token que tenha permissões de publicação. Para posts de imagem, `image_url` precisa apontar para uma imagem pública acessível pela Meta; o bot não baixa nem hospeda imagens.

Antes da publicação, os rascunhos precisam ter uma `imageUrl`. Ela pode ser informada no comando `approve`. A API não permite publicar apenas texto.

## Próximos incrementos

- painel web para revisão, edição da legenda e seleção de imagem;
- agendamento com APScheduler ou cron;
- uso opcional de um modelo de linguagem para resumir e adaptar o tom;
- monitoramento de erros, limites da API e métricas de engajamento;
- filtros por fontes confiáveis e validação editorial.
