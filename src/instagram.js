export async function publishDraft(draft, config) {
  if (!config.instagramAccountId || !config.instagramAccessToken) throw new Error('Configure INSTAGRAM_BUSINESS_ACCOUNT_ID e INSTAGRAM_ACCESS_TOKEN.');
  if (!draft.imageUrl) throw new Error('O rascunho precisa de imageUrl: a API do Instagram exige uma imagem publica.');
  const baseUrl = `https://graph.facebook.com/${config.instagramApiVersion}`;
  const params = new URLSearchParams({ image_url: draft.imageUrl, caption: draft.caption, access_token: config.instagramAccessToken });
  const creationResponse = await fetch(`${baseUrl}/${config.instagramAccountId}/media?${params}`, { method: 'POST' });
  if (!creationResponse.ok) throw new Error(`Falha ao criar midia: ${await creationResponse.text()}`);
  const { id: creationId } = await creationResponse.json();
  const publishParams = new URLSearchParams({ creation_id: creationId, access_token: config.instagramAccessToken });
  const publishResponse = await fetch(`${baseUrl}/${config.instagramAccountId}/media_publish?${publishParams}`, { method: 'POST' });
  if (!publishResponse.ok) throw new Error(`Falha ao publicar: ${await publishResponse.text()}`);
  return (await publishResponse.json()).id;
}
