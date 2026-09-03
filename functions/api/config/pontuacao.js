import { getDb } from '../../_lib/db.js';
import { exigirAdmin } from '../../_lib/auth.js';
import { obterCampeonatoPorSlug } from '../../_lib/campeonato.js';

// TODO: endpoint legado (pré multi-campeonato) — remover quando o frontend migrar
// de vez pra /api/c/:slug/config/pontuacao. Por enquanto sempre opera no campeonato original.
const SLUG_LEGADO = 'kart-da-resenha';

// GET /api/config/pontuacao -> tabela de pontos por posição + pontos de volta mais rápida
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const campeonato = await obterCampeonatoPorSlug(sql, SLUG_LEGADO);

  const posicoes = await sql`
    SELECT posicao, pontos FROM config_pontuacao_posicao WHERE campeonato_id = ${campeonato.id} ORDER BY posicao
  `;
  const [voltaRapida] = await sql`
    SELECT valor FROM config_geral WHERE campeonato_id = ${campeonato.id} AND chave = 'pontos_melhor_volta'
  `;

  return Response.json({
    posicoes,
    pontos_melhor_volta: voltaRapida ? Number(voltaRapida.valor) : 0
  });
}

// PUT /api/config/pontuacao -> atualizar pontuação (área admin)
// body: { posicoes: [{ posicao, pontos }], pontos_melhor_volta }
export async function onRequestPut(context) {
  const negado = await exigirAdmin(context);
  if (negado) return negado;

  const sql = getDb(context.env);
  const campeonato = await obterCampeonatoPorSlug(sql, SLUG_LEGADO);
  const { posicoes, pontos_melhor_volta } = await context.request.json();

  for (const p of posicoes) {
    await sql`
      INSERT INTO config_pontuacao_posicao (campeonato_id, posicao, pontos) VALUES (${campeonato.id}, ${p.posicao}, ${p.pontos})
      ON CONFLICT (campeonato_id, posicao) DO UPDATE SET pontos = ${p.pontos}
    `;
  }

  if (pontos_melhor_volta != null) {
    await sql`
      INSERT INTO config_geral (campeonato_id, chave, valor) VALUES (${campeonato.id}, 'pontos_melhor_volta', ${String(pontos_melhor_volta)})
      ON CONFLICT (campeonato_id, chave) DO UPDATE SET valor = ${String(pontos_melhor_volta)}
    `;
  }

  return Response.json({ ok: true });
}
