import { getDb } from '../../../../_lib/db.js';
import { exigirCampeonato } from '../../../../_lib/campeonato.js';

// GET /api/c/:slug/ranking -> classificação geral do campeonato
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const vinculados = await sql`
    SELECT * FROM vw_ranking_geral WHERE campeonato_id = ${campeonato.id}
  `;

  const naoVinculados = await sql`
    SELECT
      TRIM(r.nome_bruto) AS nome,
      COUNT(DISTINCT r.bateria_id) AS total_corridas,
      COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos_totais,
      MIN(r.melhor_volta_ms) AS melhor_volta_ms_historico
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.piloto_id IS NULL AND e.campeonato_id = ${campeonato.id}
    GROUP BY TRIM(r.nome_bruto)
  `;

  const ranking = [
    ...vinculados.map((p) => ({ ...p, vinculado: true })),
    ...naoVinculados.map((p) => ({ ...p, piloto_id: null, foto_url: null, vinculado: false }))
  ].sort((a, b) => Number(b.pontos_totais) - Number(a.pontos_totais));

  return Response.json(ranking);
}
