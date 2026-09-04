import { getDb } from '../../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';

// GET /api/c/:slug/pilotos/gerenciar -> todos os pilotos aprovados, incluindo ocultos (só admin)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const pilotos = await sql`
    SELECT id, nome, foto_url, email, telefone, instagram, oculto
    FROM pilotos
    WHERE campeonato_id = ${campeonato.id} AND status = 'aprovado'
    ORDER BY nome
  `;
  return Response.json(pilotos);
}

// POST /api/c/:slug/pilotos/gerenciar -> alterna visibilidade no ranking
// body: { id, oculto: true|false }
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { id, oculto } = await context.request.json();

  const [piloto] = await sql`
    UPDATE pilotos SET oculto = ${oculto}
    WHERE id = ${id} AND campeonato_id = ${campeonato.id}
    RETURNING id, nome, oculto
  `;

  return Response.json(piloto);
}
