import { getDb } from '../../_lib/db.js';
import { exigirAdmin } from '../../_lib/auth.js';
import { obterCampeonatoPorSlug } from '../../_lib/campeonato.js';

const SLUG_LEGADO = 'kart-da-resenha';

// GET /api/pilotos/gerenciar -> todos os pilotos aprovados, incluindo os ocultos (só admin)
export async function onRequestGet(context) {
  const negado = await exigirAdmin(context);
  if (negado) return negado;

  const sql = getDb(context.env);
  const campeonato = await obterCampeonatoPorSlug(sql, SLUG_LEGADO);
  const pilotos = await sql`
    SELECT id, nome, foto_url, email, telefone, instagram, oculto
    FROM pilotos
    WHERE campeonato_id = ${campeonato.id} AND status = 'aprovado'
    ORDER BY nome
  `;
  return Response.json(pilotos);
}

// POST /api/pilotos/gerenciar -> alterna visibilidade no ranking
// body: { id, oculto: true|false }
export async function onRequestPost(context) {
  const negado = await exigirAdmin(context);
  if (negado) return negado;

  const sql = getDb(context.env);
  const { id, oculto } = await context.request.json();

  const [piloto] = await sql`
    UPDATE pilotos SET oculto = ${oculto}
    WHERE id = ${id}
    RETURNING id, nome, oculto
  `;

  return Response.json(piloto);
}
