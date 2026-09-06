import { getDb } from '../../../../_lib/db.js';
import { exigirDonoCampeonato } from '../../../../_lib/autorizacao.js';

// GET /api/c/:slug/participantes -> todo mundo que já correu neste campeonato,
// tenha perfil reivindicado (qualquer status) ou não.
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
  if (negado) return negado;

  const vinculados = await sql`
    SELECT
      p.id AS piloto_id, p.nome, p.foto_url, p.status, p.oculto,
      (SELECT COUNT(DISTINCT r.bateria_id) FROM resultados r WHERE r.piloto_id = p.id) AS total_corridas
    FROM pilotos p
    WHERE p.campeonato_id = ${campeonato.id}
    ORDER BY p.nome
  `;

  const naoVinculados = await sql`
    SELECT
      TRIM(r.nome_bruto) AS nome_bruto,
      COUNT(DISTINCT r.bateria_id) AS total_corridas
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.piloto_id IS NULL AND e.campeonato_id = ${campeonato.id}
    GROUP BY TRIM(r.nome_bruto)
    ORDER BY TRIM(r.nome_bruto)
  `;

  return Response.json({
    vinculados: vinculados.map((p) => ({ ...p, vinculado: true })),
    nao_vinculados: naoVinculados.map((p) => ({ ...p, vinculado: false }))
  });
}
