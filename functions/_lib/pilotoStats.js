// Assume "temporada" = ano civil da data do evento, já que o projeto não tem um
// conceito de temporada separado no schema (corridas são esporádicas, intervalo grande).

export async function obterEstatisticasPiloto(sql, pilotoId) {
  const [stats] = await sql`
    SELECT
      COUNT(DISTINCT r.bateria_id) AS total_corridas,
      MIN(r.melhor_volta_ms) AS melhor_volta_ms,
      COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos_totais
    FROM resultados r WHERE r.piloto_id = ${pilotoId}
  `;

  const [posicaoGeral] = await sql`
    WITH ranqueado AS (
      SELECT piloto_id, pontos_totais,
             RANK() OVER (ORDER BY pontos_totais DESC) AS posicao,
             COUNT(*) OVER () AS total_pilotos
      FROM vw_ranking_geral
    )
    SELECT posicao, total_pilotos FROM ranqueado WHERE piloto_id = ${pilotoId}
  `;

  const [temporada] = await sql`
    WITH resultados_temporada AS (
      SELECT r.piloto_id, r.pontos_posicao, r.pontos_volta_rapida
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      JOIN eventos e ON e.id = b.evento_id
      WHERE EXTRACT(YEAR FROM e.data_evento) = EXTRACT(YEAR FROM now())
    ),
    pontos_temporada AS (
      SELECT p.id AS piloto_id,
             COALESCE(SUM(rt.pontos_posicao + rt.pontos_volta_rapida), 0) AS pontos
      FROM pilotos p
      LEFT JOIN resultados_temporada rt ON rt.piloto_id = p.id
      WHERE p.status = 'aprovado'
      GROUP BY p.id
    ),
    ranqueado AS (
      SELECT piloto_id, pontos,
             RANK() OVER (ORDER BY pontos DESC) AS posicao,
             COUNT(*) OVER () AS total_pilotos
      FROM pontos_temporada
    )
    SELECT pontos, posicao, total_pilotos FROM ranqueado WHERE piloto_id = ${pilotoId}
  `;

  const [ultimoEvento] = await sql`
    WITH ultimo_evento_piloto AS (
      SELECT e.id AS evento_id, e.nome, e.data_evento
      FROM eventos e
      JOIN baterias b ON b.evento_id = e.id
      JOIN resultados r ON r.bateria_id = b.id
      WHERE r.piloto_id = ${pilotoId}
      ORDER BY e.data_evento DESC
      LIMIT 1
    ),
    pontos_evento AS (
      SELECT r.piloto_id, SUM(r.pontos_posicao + r.pontos_volta_rapida) AS pontos
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      JOIN ultimo_evento_piloto ue ON ue.evento_id = b.evento_id
      GROUP BY r.piloto_id
    ),
    ranqueado AS (
      SELECT piloto_id, pontos,
             RANK() OVER (ORDER BY pontos DESC) AS posicao,
             COUNT(*) OVER () AS total_pilotos
      FROM pontos_evento
    )
    SELECT ue.evento_id, ue.nome, ue.data_evento, rk.pontos, rk.posicao, rk.total_pilotos
    FROM ultimo_evento_piloto ue
    LEFT JOIN ranqueado rk ON rk.piloto_id = ${pilotoId}
  `;

  const historico = await sql`
    WITH eventos_piloto AS (
      SELECT DISTINCT e.id AS evento_id, e.nome, e.data_evento
      FROM eventos e
      JOIN baterias b ON b.evento_id = e.id
      JOIN resultados r ON r.bateria_id = b.id
      WHERE r.piloto_id = ${pilotoId}
    ),
    pontos_por_evento AS (
      SELECT b.evento_id, r.piloto_id,
             SUM(r.pontos_posicao + r.pontos_volta_rapida) AS pontos
      FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      WHERE b.evento_id IN (SELECT evento_id FROM eventos_piloto)
      GROUP BY b.evento_id, r.piloto_id
    ),
    ranqueado AS (
      SELECT evento_id, piloto_id, pontos,
             RANK() OVER (PARTITION BY evento_id ORDER BY pontos DESC) AS posicao
      FROM pontos_por_evento
    )
    SELECT ep.evento_id, ep.nome, ep.data_evento, rk.pontos, rk.posicao
    FROM eventos_piloto ep
    JOIN ranqueado rk ON rk.evento_id = ep.evento_id AND rk.piloto_id = ${pilotoId}
    ORDER BY ep.data_evento ASC
  `;

  return {
    stats,
    ranking_geral: posicaoGeral || null,
    ranking_temporada: temporada || null,
    ultimo_evento: ultimoEvento?.evento_id ? ultimoEvento : null,
    historico
  };
}
