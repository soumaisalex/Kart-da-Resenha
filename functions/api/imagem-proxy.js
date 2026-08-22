// GET /api/imagem-proxy?url=<url-do-r2>
// Busca uma imagem do nosso próprio bucket R2 e devolve pela mesma origem do site,
// com cabeçalho de CORS liberado. Necessário porque captura de canvas (html-to-image,
// usada no card de compartilhamento) trava com imagens de outra origem sem CORS —
// o r2.dev não manda esse cabeçalho por padrão, então em vez de depender de configurar
// isso no painel do Cloudflare, resolvemos aqui.
export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url).searchParams.get('url');

  if (!url) {
    return new Response('Parâmetro "url" é obrigatório', { status: 400 });
  }

  // Só permite fazer proxy de URLs do nosso próprio bucket — evita virar um proxy aberto
  if (!env.R2_PUBLIC_BASE_URL || !url.startsWith(env.R2_PUBLIC_BASE_URL)) {
    return new Response('URL não permitida', { status: 403 });
  }

  const respOrigem = await fetch(url);
  if (!respOrigem.ok) {
    return new Response('Não foi possível buscar a imagem', { status: 502 });
  }

  const headers = new Headers(respOrigem.headers);
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=86400');

  return new Response(respOrigem.body, { status: 200, headers });
}
