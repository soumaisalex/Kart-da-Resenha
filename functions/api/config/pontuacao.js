import { getDb } from '../../_lib/db.js';

// GET /api/config/pontuacao -> tabela de pontos por posição + pontos de volta mais rápida
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const posicoes = await sql`SELECT posicao, pontos FROM config_pontuacao_posicao ORDER BY posicao`;
  const [voltaRapida] = await sql`SELECT valor FROM config_geral WHERE chave = 'pontos_melhor_volta'`;

  return Response.json({
    posicoes,
    pontos_melhor_volta: voltaRapida ? Number(voltaRapida.valor) : 0
  });
}

// PUT /api/config/pontuacao -> atualizar pontuação (área admin)
// body: { posicoes: [{ posicao, pontos }], pontos_melhor_volta }
export async function onRequestPut(context) {
  const sql = getDb(context.env);
  const { posicoes, pontos_melhor_volta } = await context.request.json();

  for (const p of posicoes) {
    await sql`
      INSERT INTO config_pontuacao_posicao (posicao, pontos) VALUES (${p.posicao}, ${p.pontos})
      ON CONFLICT (posicao) DO UPDATE SET pontos = ${p.pontos}
    `;
  }

  if (pontos_melhor_volta != null) {
    await sql`
      INSERT INTO config_geral (chave, valor) VALUES ('pontos_melhor_volta', ${String(pontos_melhor_volta)})
      ON CONFLICT (chave) DO UPDATE SET valor = ${String(pontos_melhor_volta)}
    `;
  }

  return Response.json({ ok: true });
}
