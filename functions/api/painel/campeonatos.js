import { getDb } from '../../_lib/db.js';
import { verificarSessaoAdmin } from '../../_lib/auth.js';

function gerarSlug(nome) {
  return nome
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// GET /api/painel/campeonatos -> campeonatos que a conta logada é dona
export async function onRequestGet(context) {
  const sessao = await verificarSessaoAdmin(context);
  if (!sessao) return Response.json({ erro: 'Não autenticado' }, { status: 401 });

  const sql = getDb(context.env);
  const campeonatos = await sql`
    SELECT id, slug, nome, criado_em FROM campeonatos
    WHERE conta_id = ${sessao.contaId}
    ORDER BY criado_em ASC
  `;
  return Response.json(campeonatos);
}

// POST /api/painel/campeonatos -> cria um campeonato novo pra conta logada
// body: { nome }
// O slug é gerado automaticamente a partir do nome (com sufixo numérico se já existir).
// Já semeia a pontuação padrão (estilo F1) pra sair funcionando sem precisar configurar nada.
export async function onRequestPost(context) {
  const sessao = await verificarSessaoAdmin(context);
  if (!sessao) return Response.json({ erro: 'Não autenticado' }, { status: 401 });

  const sql = getDb(context.env);
  const { nome } = await context.request.json();

  if (!nome || !nome.trim()) {
    return Response.json({ erro: 'Nome é obrigatório' }, { status: 400 });
  }

  const slugBase = gerarSlug(nome.trim());
  if (!slugBase) {
    return Response.json({ erro: 'Não foi possível gerar um endereço a partir desse nome' }, { status: 400 });
  }

  let slug = slugBase;
  let sufixo = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const [existente] = await sql`SELECT 1 FROM campeonatos WHERE slug = ${slug}`;
    if (!existente) break;
    slug = `${slugBase}-${sufixo}`;
    sufixo++;
  }

  const [campeonato] = await sql`
    INSERT INTO campeonatos (conta_id, slug, nome)
    VALUES (${sessao.contaId}, ${slug}, ${nome.trim()})
    RETURNING id, slug, nome, criado_em
  `;

  const pontosPadrao = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1];
  for (let i = 0; i < pontosPadrao.length; i++) {
    await sql`
      INSERT INTO config_pontuacao_posicao (campeonato_id, posicao, pontos)
      VALUES (${campeonato.id}, ${i + 1}, ${pontosPadrao[i]})
    `;
  }
  await sql`INSERT INTO config_geral (campeonato_id, chave, valor) VALUES (${campeonato.id}, 'pontos_melhor_volta', '5')`;
  await sql`INSERT INTO config_geral (campeonato_id, chave, valor) VALUES (${campeonato.id}, 'idade_minima', '18')`;

  return Response.json(campeonato, { status: 201 });
}
