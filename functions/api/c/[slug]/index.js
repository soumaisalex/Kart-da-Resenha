import { getDb } from '../../../_lib/db.js';
import { exigirCampeonato } from '../../../_lib/campeonato.js';

// GET /api/c/:slug -> dados básicos do campeonato
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  return Response.json({ id: campeonato.id, slug: campeonato.slug, nome: campeonato.nome });
}
