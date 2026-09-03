import { getDb } from '../../../../_lib/db.js';
import { exigirCampeonato } from '../../../../_lib/campeonato.js';

// GET /api/c/:slug/eventos/ultima-corrida -> destaque de volta mais rápida do evento passado mais recente
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const [destaque] = await sql`
    WITH ultimo_evento AS (
      SELECT id, nome, data_evento
      FROM eventos
      WHERE campeonato_id = ${campeonato.id} AND tipo = 'passado'
      ORDER BY data_evento DESC
      LIMIT 1
    )
    SELECT
      ue.id AS evento_id, ue.nome AS evento_nome, ue.data_evento,
      r.nome_bruto, r.melhor_volta_ms,
      p.id AS piloto_id, p.nome AS piloto_nome, p.foto_url
    FROM ultimo_evento ue
    JOIN baterias b ON b.evento_id = ue.id
    JOIN resultados r ON r.bateria_id = b.id
    LEFT JOIN pilotos p ON p.id = r.piloto_id
    WHERE r.melhor_volta_ms IS NOT NULL AND (p.id IS NULL OR p.oculto = false)
    ORDER BY r.melhor_volta_ms ASC
    LIMIT 1
  `;

  if (!destaque) return Response.json(null, { status: 200 });
  return Response.json(destaque);
}
