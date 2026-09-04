import { getDb } from '../../../../_lib/db.js';
import { calcularPontos } from '../../../../_lib/pontuacao.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';

// POST /api/c/:slug/resultados/importar
// body:
// {
//   evento: { id?, nome, data_evento, local, arquivo_original_url },
//   bateria: { descricao, horario },
//   resultados: [ { nome_bruto, piloto_id?, posicao, numero_kart, melhor_volta_ms, tempo_total_ms, gap_texto, total_voltas, vel_media } ]
// }
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const body = await context.request.json();
  const { evento, bateria, resultados } = body;
  if (!resultados || !resultados.length) {
    return Response.json({ erro: 'Nenhum resultado para importar' }, { status: 400 });
  }

  // 1. Evento (novo ou existente dentro do mesmo campeonato, sempre marcado como 'passado')
  let eventoId = evento.id;
  if (!eventoId) {
    const [novoEvento] = await sql`
      INSERT INTO eventos (campeonato_id, nome, data_evento, local, tipo, arquivo_original_url)
      VALUES (${campeonato.id}, ${evento.nome || null}, ${evento.data_evento}, ${evento.local || null}, 'passado', ${evento.arquivo_original_url || null})
      RETURNING id
    `;
    eventoId = novoEvento.id;
  } else {
    const [existente] = await sql`
      UPDATE eventos SET tipo = 'passado', arquivo_original_url = COALESCE(${evento.arquivo_original_url}, arquivo_original_url)
      WHERE id = ${eventoId} AND campeonato_id = ${campeonato.id}
      RETURNING id
    `;
    if (!existente) return Response.json({ erro: 'Evento não encontrado neste campeonato' }, { status: 404 });
  }

  // 2. Bateria
  const [novaBateria] = await sql`
    INSERT INTO baterias (evento_id, horario, descricao)
    VALUES (${eventoId}, ${bateria?.horario || null}, ${bateria?.descricao || null})
    RETURNING id
  `;
  const bateriaId = novaBateria.id;

  // 3. Descobre quem fez a volta mais rápida da bateria
  const tempos = resultados.map((r) => r.melhor_volta_ms).filter((t) => t != null);
  const menorVolta = tempos.length ? Math.min(...tempos) : null;

  // 4. Insere cada resultado já com pontos calculados (conforme a config deste campeonato)
  const inseridos = [];
  for (const r of resultados) {
    const ehVoltaMaisRapida = menorVolta != null && r.melhor_volta_ms === menorVolta;
    const { pontosPosicao, pontosVoltaRapida } = await calcularPontos(sql, {
      campeonatoId: campeonato.id,
      posicao: r.posicao,
      ehVoltaMaisRapida
    });

    const [linha] = await sql`
      INSERT INTO resultados (
        bateria_id, piloto_id, nome_bruto, posicao, numero_kart,
        melhor_volta_ms, tempo_total_ms, gap_texto, total_voltas, vel_media,
        pontos_posicao, pontos_volta_rapida
      ) VALUES (
        ${bateriaId}, ${r.piloto_id || null}, ${r.nome_bruto}, ${r.posicao}, ${r.numero_kart || null},
        ${r.melhor_volta_ms || null}, ${r.tempo_total_ms || null}, ${r.gap_texto || null}, ${r.total_voltas || null}, ${r.vel_media || null},
        ${pontosPosicao}, ${pontosVoltaRapida}
      )
      RETURNING id, nome_bruto, posicao, pontos_posicao, pontos_volta_rapida
    `;
    inseridos.push(linha);
  }

  return Response.json({ evento_id: eventoId, bateria_id: bateriaId, resultados: inseridos }, { status: 201 });
}
