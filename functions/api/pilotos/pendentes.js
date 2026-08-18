import { getDb } from '../../_lib/db.js';

// GET /api/pilotos/pendentes -> fila de aprovação (área admin)
// TODO: proteger com sessão de admin (ver functions/api/auth/login.js)
export async function onRequestGet(context) {
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
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { id, acao } = await context.request.json();

  const novoStatus = acao === 'aprovar' ? 'aprovado' : 'rejeitado';
  const [piloto] = await sql`
    UPDATE pilotos SET status = ${novoStatus}, aprovado_em = now()
    WHERE id = ${id}
    RETURNING id, nome, status
  `;

  return Response.json(piloto);
}
