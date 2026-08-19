import { exigirAdmin } from '../../_lib/auth.js';

// POST /api/ocr
// body: multipart/form-data com o arquivo (imagem) da tabela de resultados
//
// Fluxo:
// 1. Recebe o arquivo, sobe pro R2 (arquivo_original_url)
// 2. Chama Workers AI (modelo de visão) com um prompt estruturado pedindo JSON
// 3. Retorna o JSON extraído para a tela de revisão no admin (NÃO grava em `resultados` ainda)
//
// IMPORTANTE: o modelo de visão do Workers AI só processa IMAGENS (JPG/PNG/WEBP),
// não PDF — um PDF não é uma imagem, é um contêiner de documento, e passar os bytes
// dele direto pro modelo falha silenciosamente. Por isso validamos o tipo antes.

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

  // Confere se os bindings necessários estão configurados antes de tentar usá-los —
  // evita uma exceção não tratada (que vira página HTML de erro) por binding ausente.
  if (!env.RESULTADOS_BUCKET) {
    return Response.json({ erro: 'Bucket R2 (RESULTADOS_BUCKET) não está configurado neste ambiente.' }, { status: 500 });
  }
  if (!env.AI) {
    return Response.json({ erro: 'Workers AI (binding AI) não está configurado neste ambiente.' }, { status: 500 });
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

  const arquivo = formData.get('arquivo');
  if (!arquivo) {
    return Response.json({ erro: 'Arquivo não enviado (campo "arquivo")' }, { status: 400 });
  }

  if (!arquivo.type?.startsWith('image/')) {
    return Response.json(
      {
        erro:
          'Por enquanto só a leitura automática de imagens (JPG/PNG) é suportada — PDF ainda não. ' +
          'Tire uma foto da tabela ou exporte a página como imagem e envie de novo.'
      },
      { status: 400 }
    );
  }

  try {
    // 1. Upload pro R2
    const nomeArquivo = `originais/${Date.now()}-${arquivo.name}`;
    await env.RESULTADOS_BUCKET.put(nomeArquivo, await arquivo.arrayBuffer(), {
      httpMetadata: { contentType: arquivo.type }
    });
    const arquivoUrl = `${env.R2_PUBLIC_BASE_URL}/${nomeArquivo}`;

    // 2. OCR via Workers AI (modelo de visão)
    const bytes = new Uint8Array(await arquivo.arrayBuffer());
    const resultadoIA = await env.AI.run('@cf/meta/llama-3.2-11b-vision-instruct', {
      prompt: PROMPT_EXTRACAO,
      image: Array.from(bytes)
    });

    let dadosExtraidos;
    try {
      const textoLimpo = resultadoIA.response.replace(/```json|```/g, '').trim();
      dadosExtraidos = JSON.parse(textoLimpo);
    } catch {
      return Response.json(
        { erro: 'A IA não devolveu um JSON válido. Tente novamente com uma imagem mais nítida.', bruto: resultadoIA.response },
        { status: 422 }
      );
    }

    return Response.json({ arquivo_original_url: arquivoUrl, ...dadosExtraidos });
  } catch (e) {
    // Nunca deixa uma exceção virar página HTML — sempre devolve JSON com detalhe
    // suficiente pra diagnosticar (esse endpoint só é acessível já autenticado como admin).
    return Response.json(
      { erro: 'Falha ao processar o arquivo.', detalhe: e?.message || String(e) },
      { status: 500 }
    );
  }
}
