import { getDb } from '../../_lib/db.js';

// GET /api/publico/ultimas-provas -> as 3 corridas mais recentes de toda a plataforma
// Usado na landing page pra mostrar exemplos reais de campeonatos em atividade.
export async function onRequestGet(context) {
  const sql = getDb(context.env);

  const provas = await sql`
    WITH ultimos_eventos AS (
      SELECT e.id, e.nome, e.data_evento, e.local, e.campeonato_id
      FROM eventos e
      WHERE e.tipo = 'passado'
      ORDER BY e.data_evento DESC
      LIMIT 3
    )
    SELECT
      ue.id AS evento_id, ue.nome AS evento_nome, ue.data_evento, ue.local,
      c.nome AS campeonato_nome, c.slug AS campeonato_slug,
      vencedor.nome AS vencedor_nome
    FROM ultimos_eventos ue
    JOIN campeonatos c ON c.id = ue.campeonato_id
    LEFT JOIN LATERAL (
      SELECT COALESCE(p.nome, r.nome_bruto) AS nome
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      LEFT JOIN pilotos p ON p.id = r.piloto_id
      WHERE b.evento_id = ue.id AND r.posicao = 1
      ORDER BY b.id
      LIMIT 1
    ) vencedor ON true
    ORDER BY ue.data_evento DESC
  `;

  return Response.json(provas);
}
