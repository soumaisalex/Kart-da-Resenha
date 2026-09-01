// Assume "temporada" = ano civil da data do evento, já que o projeto não tem um
// conceito de temporada separado no schema (corridas são esporádicas, intervalo grande).
//
// IMPORTANTE: os rankings (geral, temporada, último evento) contam TODO MUNDO que já
// correu — piloto com perfil vinculado e aprovado, OU resultado ainda "solto" (sem
// perfil, identificado pelo nome_bruto lido na tabela). Não faz sentido excluir da
// contagem quem ainda não reivindicou perfil: ele correu, ele conta.
//
// Todo lugar que compara ou agrupa por nome_bruto usa TRIM() — o texto lido pela OCR
// às vezes vem com espaços extras nas pontas, o que faria duas linhas do mesmo piloto
// virarem grupos diferentes (ou o nome não bater na busca de "/api/pilotos/por-nome").
//
// Duas funções de entrada:
// - obterEstatisticasPiloto: pra quem já tem perfil (piloto_id)
// - obterEstatisticasNaoVinculado: pra resultados ainda soltos (nome_bruto)
// Ambas devolvem exatamente o mesmo formato de dados, pra reaproveitar os mesmos
// componentes de exibição (estatísticas, rankings, gráfico de evolução) nos dois casos.

export async function obterEstatisticasPiloto(sql, pilotoId) {
  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT r.bateria_id) AS total_corridas,
      MIN(r.melhor_volta_ms) AS melhor_volta_ms,
      COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos_totais,
      AVG(r.vel_media) AS vel_media_media
    FROM resultados r WHERE r.piloto_id = ${pilotoId}
  `;

  const [rankingGeral] = await sql`
    WITH todos AS (
      SELECT p.id AS piloto_id, NULL::text AS nome_bruto,
             COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos
      FROM pilotos p
      LEFT JOIN resultados r ON r.piloto_id = p.id
      WHERE p.status = 'aprovado' AND p.oculto = false
      GROUP BY p.id
      UNION ALL
      SELECT NULL::int AS piloto_id, TRIM(r.nome_bruto) AS nome_bruto,
             COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos
      FROM resultados r
      WHERE r.piloto_id IS NULL
      GROUP BY TRIM(r.nome_bruto)
    ),
    ranqueado AS (
      SELECT *, RANK() OVER (ORDER BY pontos DESC) AS posicao, COUNT(*) OVER () AS total_pilotos
      FROM todos
    )
    SELECT posicao, total_pilotos FROM ranqueado WHERE piloto_id = ${pilotoId}
  `;

  const [rankingTemporada] = await sql`
    WITH resultados_temporada AS (
      SELECT r.piloto_id, r.nome_bruto, r.pontos_posicao, r.pontos_volta_rapida
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      JOIN eventos e ON e.id = b.evento_id
      WHERE EXTRACT(YEAR FROM e.data_evento) = EXTRACT(YEAR FROM now())
    ),
    todos AS (
      SELECT p.id AS piloto_id, NULL::text AS nome_bruto,
             COALESCE(SUM(rt.pontos_posicao + rt.pontos_volta_rapida), 0) AS pontos
      FROM pilotos p
      LEFT JOIN resultados_temporada rt ON rt.piloto_id = p.id
      WHERE p.status = 'aprovado' AND p.oculto = false
      GROUP BY p.id
      UNION ALL
      SELECT NULL::int AS piloto_id, TRIM(rt.nome_bruto) AS nome_bruto,
             COALESCE(SUM(rt.pontos_posicao + rt.pontos_volta_rapida), 0) AS pontos
      FROM resultados_temporada rt
      WHERE rt.piloto_id IS NULL
      GROUP BY TRIM(rt.nome_bruto)
    ),
    ranqueado AS (
      SELECT *, RANK() OVER (ORDER BY pontos DESC) AS posicao, COUNT(*) OVER () AS total_pilotos
      FROM todos
    )
    SELECT pontos, posicao, total_pilotos FROM ranqueado WHERE piloto_id = ${pilotoId}
  `;

  // "Última corrida" mostra a posição LITERAL de chegada naquela bateria específica —
  // de propósito NÃO é um rank calculado por pontos, porque o bônus de volta mais rápida
  // pode inflar a pontuação de alguém sem mudar sua posição real no pódio daquela corrida
  // (ex: 3º colocado que fez a volta mais rápida não deve aparecer como "2º" por causa disso).
  const [ultimoEvento] = await sql`
    WITH ultima_bateria AS (
      SELECT b.id AS bateria_id, e.id AS evento_id, e.nome, e.data_evento, r.posicao
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      JOIN eventos e ON e.id = b.evento_id
      WHERE r.piloto_id = ${pilotoId}
      ORDER BY e.data_evento DESC, b.horario DESC NULLS LAST, b.id DESC
      LIMIT 1
    )
    SELECT
      ub.evento_id, ub.nome, ub.data_evento, ub.posicao,
      (SELECT COUNT(*) FROM resultados r2 WHERE r2.bateria_id = ub.bateria_id) AS total_pilotos
    FROM ultima_bateria ub
  `;

  const historico = await sql`
    SELECT
      e.id AS evento_id, e.nome AS evento_nome, e.data_evento, b.descricao AS bateria_descricao,
      r.posicao, r.pontos_posicao, r.pontos_volta_rapida,
      r.melhor_volta_ms, r.tempo_total_ms, r.total_voltas, r.vel_media
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.piloto_id = ${pilotoId}
    ORDER BY e.data_evento ASC, b.horario ASC NULLS LAST, b.id ASC
  `;

  return {
    stats,
    ranking_geral: rankingGeral || null,
    ranking_temporada: rankingTemporada || null,
    ultimo_evento: ultimoEvento?.evento_id ? ultimoEvento : null,
    historico
  };
}

export async function obterEstatisticasNaoVinculado(sql, nomeBruto) {
  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT r.bateria_id) AS total_corridas,
      MIN(r.melhor_volta_ms) AS melhor_volta_ms,
      COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos_totais,
      AVG(r.vel_media) AS vel_media_media
    FROM resultados r WHERE r.piloto_id IS NULL AND TRIM(r.nome_bruto) ILIKE ${nomeBruto}
  `;

  const [rankingGeral] = await sql`
    WITH todos AS (
      SELECT p.id AS piloto_id, NULL::text AS nome_bruto,
             COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos
      FROM pilotos p
      LEFT JOIN resultados r ON r.piloto_id = p.id
      WHERE p.status = 'aprovado' AND p.oculto = false
      GROUP BY p.id
      UNION ALL
      SELECT NULL::int AS piloto_id, TRIM(r.nome_bruto) AS nome_bruto,
             COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos
      FROM resultados r
      WHERE r.piloto_id IS NULL
      GROUP BY TRIM(r.nome_bruto)
    ),
    ranqueado AS (
      SELECT *, RANK() OVER (ORDER BY pontos DESC) AS posicao, COUNT(*) OVER () AS total_pilotos
      FROM todos
    )
    SELECT posicao, total_pilotos FROM ranqueado WHERE nome_bruto ILIKE ${nomeBruto}
  `;

  const [rankingTemporada] = await sql`
    WITH resultados_temporada AS (
      SELECT r.piloto_id, r.nome_bruto, r.pontos_posicao, r.pontos_volta_rapida
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      JOIN eventos e ON e.id = b.evento_id
      WHERE EXTRACT(YEAR FROM e.data_evento) = EXTRACT(YEAR FROM now())
    ),
    todos AS (
      SELECT p.id AS piloto_id, NULL::text AS nome_bruto,
             COALESCE(SUM(rt.pontos_posicao + rt.pontos_volta_rapida), 0) AS pontos
      FROM pilotos p
      LEFT JOIN resultados_temporada rt ON rt.piloto_id = p.id
      WHERE p.status = 'aprovado' AND p.oculto = false
      GROUP BY p.id
      UNION ALL
      SELECT NULL::int AS piloto_id, TRIM(rt.nome_bruto) AS nome_bruto,
             COALESCE(SUM(rt.pontos_posicao + rt.pontos_volta_rapida), 0) AS pontos
      FROM resultados_temporada rt
      WHERE rt.piloto_id IS NULL
      GROUP BY TRIM(rt.nome_bruto)
    ),
    ranqueado AS (
      SELECT *, RANK() OVER (ORDER BY pontos DESC) AS posicao, COUNT(*) OVER () AS total_pilotos
      FROM todos
    )
    SELECT pontos, posicao, total_pilotos FROM ranqueado WHERE nome_bruto ILIKE ${nomeBruto}
  `;

  const [ultimoEvento] = await sql`
    WITH ultima_bateria AS (
      SELECT b.id AS bateria_id, e.id AS evento_id, e.nome, e.data_evento, r.posicao
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      JOIN eventos e ON e.id = b.evento_id
      WHERE r.piloto_id IS NULL AND TRIM(r.nome_bruto) ILIKE ${nomeBruto}
      ORDER BY e.data_evento DESC, b.horario DESC NULLS LAST, b.id DESC
      LIMIT 1
    )
    SELECT
      ub.evento_id, ub.nome, ub.data_evento, ub.posicao,
      (SELECT COUNT(*) FROM resultados r2 WHERE r2.bateria_id = ub.bateria_id) AS total_pilotos
    FROM ultima_bateria ub
  `;

  const historico = await sql`
    SELECT
      e.id AS evento_id, e.nome AS evento_nome, e.data_evento, b.descricao AS bateria_descricao,
      r.posicao, r.pontos_posicao, r.pontos_volta_rapida,
      r.melhor_volta_ms, r.tempo_total_ms, r.total_voltas, r.vel_media
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.piloto_id IS NULL AND TRIM(r.nome_bruto) ILIKE ${nomeBruto}
    ORDER BY e.data_evento ASC, b.horario ASC NULLS LAST, b.id ASC
  `;

  return {
    stats,
    ranking_geral: rankingGeral || null,
    ranking_temporada: rankingTemporada || null,
    ultimo_evento: ultimoEvento?.evento_id ? ultimoEvento : null,
    historico
  };
}
