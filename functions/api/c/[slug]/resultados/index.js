import { getDb } from '../../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';

// GET /api/c/:slug/resultados?piloto_id=X  ou  ?nome_bruto=Y
// Lista todos os resultados (todas as corridas) desse participante, mais recente primeiro.
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const url = new URL(context.request.url);
  const pilotoId = url.searchParams.get('piloto_id');
  const nomeBruto = url.searchParams.get('nome_bruto');

  if (!pilotoId && !nomeBruto) {
    return Response.json({ erro: 'Informe piloto_id ou nome_bruto' }, { status: 400 });
  }

  const linhas = pilotoId
    ? await sql`
        SELECT
          r.id, r.nome_bruto, r.posicao, r.numero_kart, r.melhor_volta_ms, r.tempo_total_ms,
          r.gap_texto, r.total_voltas, r.vel_media, r.pontos_posicao, r.pontos_volta_rapida,
          b.id AS bateria_id, b.descricao AS bateria_descricao,
          e.id AS evento_id, e.nome AS evento_nome, e.data_evento
        FROM resultados r
        JOIN baterias b ON b.id = r.bateria_id
        JOIN eventos e ON e.id = b.evento_id
        WHERE r.piloto_id = ${pilotoId} AND e.campeonato_id = ${campeonato.id}
        ORDER BY e.data_evento DESC, b.id DESC
      `
    : await sql`
        SELECT
          r.id, r.nome_bruto, r.posicao, r.numero_kart, r.melhor_volta_ms, r.tempo_total_ms,
          r.gap_texto, r.total_voltas, r.vel_media, r.pontos_posicao, r.pontos_volta_rapida,
          b.id AS bateria_id, b.descricao AS bateria_descricao,
          e.id AS evento_id, e.nome AS evento_nome, e.data_evento
        FROM resultados r
        JOIN baterias b ON b.id = r.bateria_id
        JOIN eventos e ON e.id = b.evento_id
        WHERE r.piloto_id IS NULL AND e.campeonato_id = ${campeonato.id} AND TRIM(r.nome_bruto) ILIKE ${nomeBruto}
        ORDER BY e.data_evento DESC, b.id DESC
      `;

  return Response.json(linhas);
}
