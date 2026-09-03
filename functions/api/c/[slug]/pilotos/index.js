import { getDb } from '../../../../_lib/db.js';
import { exigirCampeonato } from '../../../../_lib/campeonato.js';

// GET /api/c/:slug/pilotos -> lista pilotos aprovados (para ranking, listas públicas)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const pilotos = await sql`
    SELECT id, nome, foto_url, instagram
    FROM pilotos
    WHERE campeonato_id = ${campeonato.id} AND status = 'aprovado' AND oculto = false
    ORDER BY nome
  `;
  return Response.json(pilotos);
}

// POST /api/c/:slug/pilotos -> reivindicar perfil
// body: { nome, telefone, email?, instagram?, foto_url?, vincular_nome_bruto? }
// - nome: nome de exibição escolhido livremente pela pessoa (não precisa bater com nada)
// - vincular_nome_bruto: nome exatamente como veio da leitura da tabela (nome_bruto),
//   usado só pra encontrar e vincular o resultado correspondente.
// Sempre entra como status = 'pendente' — aprovação manual na área admin.
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const body = await context.request.json();

  if (!body.nome || !body.nome.trim()) {
    return Response.json({ erro: 'Nome é obrigatório' }, { status: 400 });
  }
  if (!body.telefone || !body.telefone.trim()) {
    return Response.json({ erro: 'Telefone é obrigatório' }, { status: 400 });
  }

  const [piloto] = await sql`
    INSERT INTO pilotos (campeonato_id, nome, telefone, email, instagram, foto_url, status, reivindicado_em)
    VALUES (${campeonato.id}, ${body.nome.trim()}, ${body.telefone || null}, ${body.email || null},
            ${body.instagram || null}, ${body.foto_url || null}, 'pendente', now())
    RETURNING id, nome, status
  `;

  // Vincula resultados já importados, ainda sem perfil, dentro do mesmo campeonato, cujo
  // nome_bruto bate com o nome original do resultado que a pessoa clicou.
  const nomeParaVincular = (body.vincular_nome_bruto || body.nome).trim();
  await sql`
    UPDATE resultados r
    SET piloto_id = ${piloto.id}
    FROM baterias b, eventos e
    WHERE r.bateria_id = b.id AND b.evento_id = e.id
      AND r.piloto_id IS NULL
      AND e.campeonato_id = ${campeonato.id}
      AND TRIM(r.nome_bruto) ILIKE ${nomeParaVincular}
  `;

  return Response.json(piloto, { status: 201 });
}
