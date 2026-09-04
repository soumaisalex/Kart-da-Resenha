import { getDb } from '../../../../_lib/db.js';
import { exigirCampeonato } from '../../../../_lib/campeonato.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';

// GET /api/c/:slug/config/pontuacao -> tabela de pontos por posição + pontos de volta mais rápida
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const posicoes = await sql`
    SELECT posicao, pontos FROM config_pontuacao_posicao
    WHERE campeonato_id = ${campeonato.id} ORDER BY posicao
  `;
  const [voltaRapida] = await sql`
    SELECT valor FROM config_geral WHERE campeonato_id = ${campeonato.id} AND chave = 'pontos_melhor_volta'
  `;

  return Response.json({
    posicoes,
    pontos_melhor_volta: voltaRapida ? Number(voltaRapida.valor) : 0
  });
}

// PUT /api/c/:slug/config/pontuacao -> atualizar pontuação (área admin)
// body: { posicoes: [{ posicao, pontos }], pontos_melhor_volta }
export async function onRequestPut(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { posicoes, pontos_melhor_volta } = await context.request.json();

  for (const p of posicoes) {
    await sql`
      INSERT INTO config_pontuacao_posicao (campeonato_id, posicao, pontos)
      VALUES (${campeonato.id}, ${p.posicao}, ${p.pontos})
      ON CONFLICT (campeonato_id, posicao) DO UPDATE SET pontos = ${p.pontos}
    `;
  }

  if (pontos_melhor_volta != null) {
    await sql`
      INSERT INTO config_geral (campeonato_id, chave, valor)
      VALUES (${campeonato.id}, 'pontos_melhor_volta', ${String(pontos_melhor_volta)})
      ON CONFLICT (campeonato_id, chave) DO UPDATE SET valor = ${String(pontos_melhor_volta)}
    `;
  }

  return Response.json({ ok: true });
}
