import { getDb } from '../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../_lib/autorizacao.js';

// GET /api/c/:slug/eh-dono -> confirma se a sessão logada é dona deste campeonato
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;
  return Response.json({ autorizado: true });
}
