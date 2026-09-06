import { getDb } from '../../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';

// POST /api/c/:slug/participantes/renomear -> corrige o nome de alguém ainda sem perfil
// body: { nome_atual, nome_novo }
// Atualiza nome_bruto em todos os resultados que batem com o nome atual, dentro deste campeonato.
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { nome_atual, nome_novo } = await context.request.json();

  if (!nome_atual || !nome_novo || !nome_novo.trim()) {
    return Response.json({ erro: 'Nome atual e novo nome são obrigatórios' }, { status: 400 });
  }

  await sql`
    UPDATE resultados r
    SET nome_bruto = ${nome_novo.trim()}
    FROM baterias b, eventos e
    WHERE r.bateria_id = b.id AND b.evento_id = e.id
      AND r.piloto_id IS NULL
      AND e.campeonato_id = ${campeonato.id}
      AND TRIM(r.nome_bruto) ILIKE ${nome_atual}
  `;

  return Response.json({ ok: true, nome: nome_novo.trim() });
}
