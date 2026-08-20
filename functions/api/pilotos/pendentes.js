import { getDb } from '../../_lib/db.js';
import { exigirAdmin } from '../../_lib/auth.js';

// GET /api/pilotos/pendentes -> fila de aprovação (área admin)
export async function onRequestGet(context) {
  const negado = await exigirAdmin(context);
  if (negado) return negado;

  const sql = getDb(context.env);
  const pendentes = await sql`
    SELECT id, nome, telefone, email, instagram, foto_url, criado_em
    FROM pilotos
    WHERE status = 'pendente'
    ORDER BY criado_em ASC
  `;
  return Response.json(pendentes);
}

// POST /api/pilotos/pendentes -> aprovar ou rejeitar
// body: { id, acao: 'aprovar' | 'rejeitar' }
//
// Rejeitar não deixa o perfil "morto": desfaz a reivindicação por completo —
// solta os resultados que estavam vinculados a esse piloto (voltam a piloto_id = NULL,
// ou seja, aparecem de novo como "não vinculado" no ranking) e apaga o registro do piloto,
// pra alguém poder reivindicar esse nome de novo do zero.
export async function onRequestPost(context) {
  const negado = await exigirAdmin(context);
  if (negado) return negado;

  const sql = getDb(context.env);
  const { id, acao } = await context.request.json();

  if (acao === 'aprovar') {
    const [piloto] = await sql`
      UPDATE pilotos SET status = 'aprovado', aprovado_em = now()
      WHERE id = ${id}
      RETURNING id, nome, status
    `;
    return Response.json(piloto);
  }

  await sql`UPDATE resultados SET piloto_id = NULL WHERE piloto_id = ${id}`;
  const [piloto] = await sql`DELETE FROM pilotos WHERE id = ${id} RETURNING id, nome`;

  return Response.json({ ...piloto, status: 'rejeitado' });
}
