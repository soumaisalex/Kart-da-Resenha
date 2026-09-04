import { getDb } from '../../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';
import { removerPilotoEDesvincular } from '../../../../_lib/pilotoRemocao.js';

// GET /api/c/:slug/pilotos/pendentes -> fila de aprovação (área admin)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const pendentes = await sql`
    SELECT id, nome, telefone, email, instagram, foto_url, criado_em
    FROM pilotos
    WHERE campeonato_id = ${campeonato.id} AND status = 'pendente'
    ORDER BY criado_em ASC
  `;
  return Response.json(pendentes);
}

// POST /api/c/:slug/pilotos/pendentes -> aprovar ou rejeitar
// body: { id, acao: 'aprovar' | 'rejeitar' }
// Rejeitar desfaz a reivindicação por completo: solta os resultados (voltam a
// piloto_id = NULL) e apaga o registro do piloto, pra alguém poder reivindicar de novo.
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { id, acao } = await context.request.json();

  if (acao === 'aprovar') {
    const [piloto] = await sql`
      UPDATE pilotos SET status = 'aprovado', aprovado_em = now()
      WHERE id = ${id} AND campeonato_id = ${campeonato.id}
      RETURNING id, nome, status
    `;
    return Response.json(piloto);
  }

  const piloto = await removerPilotoEDesvincular(sql, id);
  return Response.json({ ...piloto, status: 'rejeitado' });
}
