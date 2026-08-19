import { getDb } from '../../_lib/db.js';

// GET /api/eventos/:id -> detalhe do evento + lista de pilotos confirmados
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { id } = context.params;

  const [evento] = await sql`
    SELECT id, nome, data_evento, local, tipo, arquivo_original_url
    FROM eventos WHERE id = ${id}
  `;
  if (!evento) return Response.json({ erro: 'Evento não encontrado' }, { status: 404 });

  const confirmados = await sql`
    SELECT p.id, p.nome, p.foto_url
    FROM confirmacoes c
    JOIN pilotos p ON p.id = c.piloto_id
    WHERE c.evento_id = ${id}
    ORDER BY c.confirmado_em ASC
  `;

  return Response.json({ ...evento, confirmados });
}
