import { getDb } from '../../../../../_lib/db.js';
import { exigirCampeonato } from '../../../../../_lib/campeonato.js';
import { exigirDonoCampeonato } from '../../../../../_lib/autorizacao.js';

// GET /api/c/:slug/eventos/:id -> detalhe do evento + confirmados + resultados
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const { id } = context.params;

  const [evento] = await sql`
    SELECT id, nome, data_evento, local, tipo, arquivo_original_url
    FROM eventos WHERE id = ${id} AND campeonato_id = ${campeonato.id}
  `;
  if (!evento) return Response.json({ erro: 'Evento não encontrado' }, { status: 404 });

  const confirmados = await sql`
    SELECT p.id, p.nome, p.foto_url
    FROM confirmacoes c
    JOIN pilotos p ON p.id = c.piloto_id
    WHERE c.evento_id = ${id}
    ORDER BY c.confirmado_em ASC
  `;

  const baterias = await sql`
    SELECT id, descricao, horario
    FROM baterias
    WHERE evento_id = ${id}
    ORDER BY horario NULLS LAST, id
  `;

  const resultados = await sql`
    SELECT r.id, r.bateria_id, r.nome_bruto, r.posicao, r.pontos_posicao, r.pontos_volta_rapida,
           r.melhor_volta_ms, r.tempo_total_ms, r.piloto_id, p.nome AS piloto_nome, p.foto_url
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    LEFT JOIN pilotos p ON p.id = r.piloto_id
    WHERE b.evento_id = ${id}
    ORDER BY b.id, r.posicao
  `;

  const bateriasComResultados = baterias.map((b) => ({
    ...b,
    resultados: resultados.filter((r) => r.bateria_id === b.id)
  }));

  return Response.json({ ...evento, confirmados, baterias: bateriasComResultados });
}

// PATCH /api/c/:slug/eventos/:id -> editar nome/data/local (só admin)
export async function onRequestPatch(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { id } = context.params;
  const body = await context.request.json();

  const [evento] = await sql`
    UPDATE eventos SET
      nome = COALESCE(${body.nome}, nome),
      data_evento = COALESCE(${body.data_evento}, data_evento),
      local = COALESCE(${body.local}, local)
    WHERE id = ${id} AND campeonato_id = ${campeonato.id}
    RETURNING id, nome, data_evento, local, tipo
  `;
  if (!evento) return Response.json({ erro: 'Evento não encontrado' }, { status: 404 });

  return Response.json(evento);
}

// DELETE /api/c/:slug/eventos/:id -> exclui o evento e tudo vinculado (só admin)
export async function onRequestDelete(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { id } = context.params;

  const [excluido] = await sql`
    DELETE FROM eventos WHERE id = ${id} AND campeonato_id = ${campeonato.id} RETURNING id
  `;
  if (!excluido) return Response.json({ erro: 'Evento não encontrado' }, { status: 404 });

  return Response.json({ ok: true });
}
