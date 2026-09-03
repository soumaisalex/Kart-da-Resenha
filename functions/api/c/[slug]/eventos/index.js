import { getDb } from '../../../../_lib/db.js';
import { exigirAdmin } from '../../../../_lib/auth.js';
import { exigirCampeonato } from '../../../../_lib/campeonato.js';

// GET /api/c/:slug/eventos -> agenda completa (passados + futuros)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const eventos = await sql`
    SELECT id, nome, data_evento, local, tipo, arquivo_original_url
    FROM eventos
    WHERE campeonato_id = ${campeonato.id}
    ORDER BY data_evento DESC
  `;
  return Response.json(eventos);
}

// POST /api/c/:slug/eventos -> criar evento futuro (área admin)
// body: { nome, data_evento, local }
export async function onRequestPost(context) {
  const negado1 = await exigirAdmin(context);
  if (negado1) return negado1;

  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const body = await context.request.json();

  if (!body.data_evento) {
    return Response.json({ erro: 'data_evento é obrigatória' }, { status: 400 });
  }

  const [evento] = await sql`
    INSERT INTO eventos (campeonato_id, nome, data_evento, local, tipo)
    VALUES (${campeonato.id}, ${body.nome || null}, ${body.data_evento}, ${body.local || null}, 'futuro')
    RETURNING id, nome, data_evento, local, tipo
  `;

  return Response.json(evento, { status: 201 });
}
