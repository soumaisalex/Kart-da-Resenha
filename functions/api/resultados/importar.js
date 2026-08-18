import { getDb } from '../../_lib/db.js';
import { calcularPontos } from '../../_lib/pontuacao.js';

// POST /api/resultados/importar
// body (já revisado/corrigido pelo admin na tela de revisão):
// {
//   evento: { id?, nome, data_evento, local, arquivo_original_url },
//   bateria: { descricao, horario },
//   resultados: [
//     { nome_bruto, piloto_id?, posicao, numero_kart, melhor_volta_ms, tempo_total_ms, gap_texto, total_voltas, vel_media }
//   ]
// }
//
// - Se evento.id vier, reaproveita o evento existente (adiciona nova bateria a ele).
// - Marca automaticamente ponto extra de volta mais rápida pra quem tiver o menor melhor_volta_ms.
// - Se algum resultado não tiver piloto_id, fica com piloto_id = null (matching feito na tela de revisão,
//   com fallback pra criar perfil novo/pendente ali mesmo).
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const body = await context.request.json();

  const { evento, bateria, resultados } = body;
  if (!resultados || !resultados.length) {
    return Response.json({ erro: 'Nenhum resultado para importar' }, { status: 400 });
  }

  // 1. Evento (novo ou existente, sempre marcado como 'passado' — já tem resultado)
  let eventoId = evento.id;
  if (!eventoId) {
    const [novoEvento] = await sql`
      INSERT INTO eventos (nome, data_evento, local, tipo, arquivo_original_url)
      VALUES (${evento.nome || null}, ${evento.data_evento}, ${evento.local || null}, 'passado', ${evento.arquivo_original_url || null})
      RETURNING id
    `;
    eventoId = novoEvento.id;
  } else {
    await sql`UPDATE eventos SET tipo = 'passado', arquivo_original_url = COALESCE(${evento.arquivo_original_url}, arquivo_original_url) WHERE id = ${eventoId}`;
  }

  // 2. Bateria
  const [novaBateria] = await sql`
    INSERT INTO baterias (evento_id, horario, descricao)
    VALUES (${eventoId}, ${bateria?.horario || null}, ${bateria?.descricao || null})
    RETURNING id
  `;
  const bateriaId = novaBateria.id;

  // 3. Descobre quem fez a volta mais rápida da bateria (menor melhor_volta_ms, ignorando nulos)
  const tempos = resultados.map(r => r.melhor_volta_ms).filter(t => t != null);
  const menorVolta = tempos.length ? Math.min(...tempos) : null;

  // 4. Insere cada resultado já com pontos calculados
  const inseridos = [];
  for (const r of resultados) {
    const ehVoltaMaisRapida = menorVolta != null && r.melhor_volta_ms === menorVolta;
    const { pontosPosicao, pontosVoltaRapida } = await calcularPontos(sql, {
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
