import { getDb } from '../../_lib/db.js';

// GET /api/pilotos -> lista pilotos aprovados (para ranking, listas públicas)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const pilotos = await sql`
    SELECT id, nome, foto_url, instagram
    FROM pilotos
    WHERE status = 'aprovado' AND oculto = false
    ORDER BY nome
  `;
  return Response.json(pilotos);
}

// POST /api/pilotos -> reivindicar perfil
// body: { nome, telefone?, email?, instagram?, foto_url?, vincular_nome_bruto? }
// - nome: nome de exibição escolhido livremente pela pessoa (não precisa bater com nada)
// - vincular_nome_bruto: nome exatamente como veio da leitura da tabela (nome_bruto),
//   usado só pra encontrar e vincular o resultado correspondente — vem preenchido quando
//   a pessoa clica em "Reivindicar" a partir de um resultado específico no ranking.
// Sempre entra como status = 'pendente' — aprovação manual na área admin.
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const body = await context.request.json();

  if (!body.nome || !body.nome.trim()) {
    return Response.json({ erro: 'Nome é obrigatório' }, { status: 400 });
  }
  if (!body.telefone || !body.telefone.trim()) {
    return Response.json({ erro: 'Telefone é obrigatório' }, { status: 400 });
  }

  const [piloto] = await sql`
    INSERT INTO pilotos (nome, telefone, email, instagram, foto_url, status, reivindicado_em)
    VALUES (${body.nome.trim()}, ${body.telefone || null}, ${body.email || null},
            ${body.instagram || null}, ${body.foto_url || null}, 'pendente', now())
    RETURNING id, nome, status
  `;

  // Vincula resultados já importados, ainda sem perfil, cujo nome_bruto bate com o nome
  // original do resultado que a pessoa clicou (vincular_nome_bruto) — ou, na ausência
  // disso (reivindicação feita direto, sem vir de um resultado específico), tenta pelo
  // próprio nome de exibição digitado, como melhor esforço.
  const nomeParaVincular = (body.vincular_nome_bruto || body.nome).trim();
  await sql`
    UPDATE resultados
    SET piloto_id = ${piloto.id}
    WHERE piloto_id IS NULL AND nome_bruto ILIKE ${nomeParaVincular}
  `;

  return Response.json(piloto, { status: 201 });
}
