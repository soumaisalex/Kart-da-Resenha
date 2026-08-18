import { getDb } from '../../_lib/db.js';

// GET /api/pilotos -> lista pilotos aprovados (para ranking, listas públicas)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const pilotos = await sql`
    SELECT id, nome, foto_url, instagram
    FROM pilotos
    WHERE status = 'aprovado'
    ORDER BY nome
  `;
  return Response.json(pilotos);
}

// POST /api/pilotos -> reivindicar perfil (nome_bruto identifica a linha de resultado a vincular)
// body: { nome, telefone?, email?, instagram?, foto_url?, resultado_id_para_vincular? }
// Sempre entra como status = 'pendente' — aprovação manual na área admin.
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const body = await context.request.json();

  if (!body.nome || !body.nome.trim()) {
    return Response.json({ erro: 'Nome é obrigatório' }, { status: 400 });
  }

  const [piloto] = await sql`
    INSERT INTO pilotos (nome, telefone, email, instagram, foto_url, status, reivindicado_em)
    VALUES (${body.nome.trim()}, ${body.telefone || null}, ${body.email || null},
            ${body.instagram || null}, ${body.foto_url || null}, 'pendente', now())
    RETURNING id, nome, status
  `;

  // TODO: se vier resultado_id_para_vincular, atualizar resultados.piloto_id = piloto.id

  return Response.json(piloto, { status: 201 });
}
