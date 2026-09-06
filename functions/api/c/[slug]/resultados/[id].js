import { getDb } from '../../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';
import { calcularPontos } from '../../../../_lib/pontuacao.js';

// Depois de qualquer edição/exclusão que possa afetar a volta mais rápida (posição ou tempo
// mudaram), recalcula o bônus pra TODA a bateria — quem tem o menor melhor_volta_ms ganha o
// bônus, todos os outros ficam com 0. Evita ficar com o bônus "grudado" em alguém que não é
// mais o mais rápido depois da correção.
async function recalcularVoltaMaisRapidaDaBateria(sql, campeonatoId, bateriaId) {
  const linhas = await sql`SELECT id, melhor_volta_ms FROM resultados WHERE bateria_id = ${bateriaId}`;
  const tempos = linhas.map((l) => l.melhor_volta_ms).filter((t) => t != null);
  const menor = tempos.length ? Math.min(...tempos) : null;

  for (const linha of linhas) {
    const ehMaisRapido = menor != null && linha.melhor_volta_ms === menor;
    const { pontosVoltaRapida } = await calcularPontos(sql, {
      campeonatoId,
      posicao: 1, // irrelevante aqui — só queremos pontosVoltaRapida
      ehVoltaMaisRapida: ehMaisRapido
    });
    await sql`UPDATE resultados SET pontos_volta_rapida = ${pontosVoltaRapida} WHERE id = ${linha.id}`;
  }
}

// PATCH /api/c/:slug/resultados/:id -> edita um resultado (posição, tempos, kart, voltas, nome)
export async function onRequestPatch(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { id } = context.params;
  const body = await context.request.json();

  const [existente] = await sql`
    SELECT r.id, r.bateria_id
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.id = ${id} AND e.campeonato_id = ${campeonato.id}
  `;
  if (!existente) return Response.json({ erro: 'Resultado não encontrado' }, { status: 404 });

  let pontosPosicao;
  if (body.posicao != null) {
    const calculo = await calcularPontos(sql, {
      campeonatoId: campeonato.id,
      posicao: Number(body.posicao),
      ehVoltaMaisRapida: false
    });
    pontosPosicao = calculo.pontosPosicao;
  }

  await sql`
    UPDATE resultados SET
      nome_bruto = COALESCE(${body.nome_bruto}, nome_bruto),
      posicao = COALESCE(${body.posicao != null ? Number(body.posicao) : null}, posicao),
      numero_kart = COALESCE(${body.numero_kart != null ? Number(body.numero_kart) : null}, numero_kart),
      melhor_volta_ms = COALESCE(${body.melhor_volta_ms != null ? Number(body.melhor_volta_ms) : null}, melhor_volta_ms),
      tempo_total_ms = COALESCE(${body.tempo_total_ms != null ? Number(body.tempo_total_ms) : null}, tempo_total_ms),
      gap_texto = COALESCE(${body.gap_texto}, gap_texto),
      total_voltas = COALESCE(${body.total_voltas != null ? Number(body.total_voltas) : null}, total_voltas),
      vel_media = COALESCE(${body.vel_media != null ? Number(body.vel_media) : null}, vel_media),
      pontos_posicao = COALESCE(${pontosPosicao}, pontos_posicao)
    WHERE id = ${id}
  `;

  await recalcularVoltaMaisRapidaDaBateria(sql, campeonato.id, existente.bateria_id);

  const [atualizado] = await sql`SELECT * FROM resultados WHERE id = ${id}`;
  return Response.json(atualizado);
}

// DELETE /api/c/:slug/resultados/:id -> remove um resultado (ex: linha duplicada por engano)
export async function onRequestDelete(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const { id } = context.params;

  const [existente] = await sql`
    SELECT r.id, r.bateria_id
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.id = ${id} AND e.campeonato_id = ${campeonato.id}
  `;
  if (!existente) return Response.json({ erro: 'Resultado não encontrado' }, { status: 404 });

  await sql`DELETE FROM resultados WHERE id = ${id}`;
  await recalcularVoltaMaisRapidaDaBateria(sql, campeonato.id, existente.bateria_id);

  return Response.json({ ok: true });
}
