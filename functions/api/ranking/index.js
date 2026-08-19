import { getDb } from '../../_lib/db.js';

// GET /api/ranking -> classificação geral (view vw_ranking_geral, já ordenada por pontos)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const ranking = await sql`SELECT * FROM vw_ranking_geral`;
  return Response.json(ranking);
}
