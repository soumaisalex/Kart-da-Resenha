import { getDb } from '../../_lib/db.js';

// GET /api/eventos -> agenda completa (passados + futuros), usada na Home e na Admin
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const eventos = await sql`
    SELECT id, nome, data_evento, local, tipo, arquivo_original_url
    FROM eventos
    ORDER BY data_evento DESC
  `;
  return Response.json(eventos);
}

// POST /api/eventos -> criar evento futuro (área admin)
// body: { nome, data_evento, local }
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const body = await context.request.json();

  if (!body.data_evento) {
    return Response.json({ erro: 'data_evento é obrigatória' }, { status: 400 });
  }

  const [evento] = await sql`
    INSERT INTO eventos (nome, data_evento, local, tipo)
    VALUES (${body.nome || null}, ${body.data_evento}, ${body.local || null}, 'futuro')
    RETURNING id, nome, data_evento, local, tipo
  `;

  return Response.json(evento, { status: 201 });
}
