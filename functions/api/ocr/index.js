import { exigirAdmin } from '../../_lib/auth.js';

// POST /api/ocr
// body: multipart/form-data com o arquivo (imagem ou PDF) da tabela de resultados
//
// Fluxo:
// 1. Recebe o arquivo, sobe pro R2 (arquivo_original_url) — ainda como rascunho/temporário
// 2. Chama Workers AI (modelo de visão) com um prompt estruturado pedindo JSON
// 3. Retorna o JSON extraído para a tela de revisão no admin (NÃO grava em `resultados` ainda)
//
// A gravação definitiva acontece em /api/resultados/importar, depois que o admin
// confirma/corrige os campos na tela de revisão.

const PROMPT_EXTRACAO = `
Você está lendo uma tabela de resultados de corrida de kart (formato Piquet Kart / LapTime).
Extraia para JSON estrito, sem texto fora do JSON, no seguinte formato:
{
  "evento": { "data": "YYYY-MM-DD", "local": "string", "descricao_bateria": "string" },
  "resultados": [
    {
      "posicao": number,
      "numero_kart": number,
      "nome": "string exatamente como escrito",
      "melhor_volta": "mm:ss.mmm ou hh:mm:ss.mmm",
      "tempo_total": "hh:mm:ss.mmm",
      "gap": "string ou null",
      "total_voltas": number,
      "vel_media": number
    }
  ]
}
Se algum campo não existir na imagem, use null. Não invente dados.
`;

export async function onRequestPost(context) {
  const negado = await exigirAdmin(context);
  if (negado) return negado;

  const { env, request } = context;

  const formData = await request.formData();
  const arquivo = formData.get('arquivo');
  if (!arquivo) {
    return Response.json({ erro: 'Arquivo não enviado (campo "arquivo")' }, { status: 400 });
  }

  // 1. Upload pro R2 (bucket configurado como binding "RESULTADOS_BUCKET" no wrangler.toml)
  const nomeArquivo = `originais/${Date.now()}-${arquivo.name}`;
  await env.RESULTADOS_BUCKET.put(nomeArquivo, await arquivo.arrayBuffer(), {
    httpMetadata: { contentType: arquivo.type }
  });
  const arquivoUrl = `${env.R2_PUBLIC_BASE_URL}/${nomeArquivo}`;

  // 2. OCR via Workers AI (modelo de visão) — ajustar nome do modelo conforme disponibilidade
  const bytes = new Uint8Array(await arquivo.arrayBuffer());
  const resultadoIA = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
    prompt: PROMPT_EXTRACAO,
    image: Array.from(bytes)
  });

  let dadosExtraidos;
  try {
    const textoLimpo = resultadoIA.response.replace(/```json|```/g, '').trim();
    dadosExtraidos = JSON.parse(textoLimpo);
  } catch (e) {
    return Response.json(
      { erro: 'Não foi possível interpretar a resposta da IA', bruto: resultadoIA.response },
      { status: 422 }
    );
  }

  return Response.json({ arquivo_original_url: arquivoUrl, ...dadosExtraidos });
}
