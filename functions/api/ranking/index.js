import { getDb } from '../../_lib/db.js';

// GET /api/ranking -> classificação geral, combinando:
// - pilotos com perfil vinculado e aprovado (view vw_ranking_geral)
// - resultados ainda sem perfil vinculado (piloto_id null), agrupados pelo nome como
//   veio da leitura da tabela (nome_bruto) — sem isso, um resultado nunca aparecia em
//   lugar nenhum até alguém "adivinhar" que precisava ir em /reivindicar digitar o nome.
// Os dois grupos são ordenados juntos por pontos, e o frontend distingue visualmente
// quem já tem perfil (link pro perfil) de quem ainda não tem (link pra reivindicar).
export async function onRequestGet(context) {
  const sql = getDb(context.env);

  const vinculados = await sql`SELECT * FROM vw_ranking_geral`;

  const naoVinculados = await sql`
    SELECT
      r.nome_bruto AS nome,
      COUNT(DISTINCT r.bateria_id) AS total_corridas,
      COALESCE(SUM(r.pontos_posicao + r.pontos_volta_rapida), 0) AS pontos_totais,
      MIN(r.melhor_volta_ms) AS melhor_volta_ms_historico
    FROM resultados r
    WHERE r.piloto_id IS NULL
    GROUP BY r.nome_bruto
  `;

  const ranking = [
    ...vinculados.map((p) => ({ ...p, vinculado: true })),
    ...naoVinculados.map((p) => ({ ...p, piloto_id: null, foto_url: null, vinculado: false }))
  ].sort((a, b) => Number(b.pontos_totais) - Number(a.pontos_totais));

  return Response.json(ranking);
}
