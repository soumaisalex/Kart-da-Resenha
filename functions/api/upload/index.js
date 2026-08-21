// POST /api/upload
// body: multipart/form-data com o arquivo no campo "foto"
// Sem exigência de admin — usado tanto na reivindicação de perfil quanto na autoedição,
// que são ações públicas (só travadas por telefone, não por sessão de admin).
export async function onRequestPost(context) {
  const { env, request } = context;

  if (!env.RESULTADOS_BUCKET) {
    return Response.json({ erro: 'Bucket R2 não está configurado neste ambiente.' }, { status: 500 });
  }
  if (!env.R2_PUBLIC_BASE_URL) {
    return Response.json({ erro: 'R2_PUBLIC_BASE_URL não está configurada nas variáveis de ambiente.' }, { status: 500 });
  }

  let formData;
  try {
    formData = await request.formData();
  } catch {
    return Response.json({ erro: 'Não foi possível ler o arquivo enviado.' }, { status: 400 });
  }

  const arquivo = formData.get('foto');
  if (!arquivo) {
    return Response.json({ erro: 'Arquivo não enviado (campo "foto")' }, { status: 400 });
  }
  if (!arquivo.type?.startsWith('image/')) {
    return Response.json({ erro: 'Envie apenas imagens (JPG, PNG, WEBP).' }, { status: 400 });
  }

  const TAMANHO_MAX = 8 * 1024 * 1024; // 8MB
  if (arquivo.size > TAMANHO_MAX) {
    return Response.json({ erro: 'Imagem muito grande — envie uma de até 8MB.' }, { status: 400 });
  }

  try {
    const nomeSanitizado = arquivo.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    const nomeArquivo = `perfis/${Date.now()}-${nomeSanitizado}`;

    await env.RESULTADOS_BUCKET.put(nomeArquivo, await arquivo.arrayBuffer(), {
      httpMetadata: { contentType: arquivo.type }
    });

    const url = `${env.R2_PUBLIC_BASE_URL}/${nomeArquivo}`;
    return Response.json({ url });
  } catch (e) {
    return Response.json(
      { erro: 'Falha ao enviar a imagem.', detalhe: e?.message || String(e) },
      { status: 500 }
    );
  }
}
