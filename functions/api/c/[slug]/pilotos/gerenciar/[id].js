import { getDb } from '../../../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../../../_lib/autorizacao.js';
import { removerPilotoEDesvincular } from '../../../../../_lib/pilotoRemocao.js';

// DELETE /api/c/:slug/pilotos/gerenciar/:id -> exclui o piloto (só admin)
// Os resultados dele voltam a piloto_id = NULL — o nome volta a poder ser reivindicado.
export async function onRequestDelete(context) {
  const sql = getDb(context.env);
  const { negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { id } = context.params;

  const piloto = await removerPilotoEDesvincular(sql, id);
  if (!piloto) return Response.json({ erro: 'Piloto não encontrado' }, { status: 404 });

  return Response.json({ ok: true });
}
