import { getDb } from '../../../../../_lib/db.js';
import { obterEstatisticasNaoVinculado } from '../../../../../_lib/pilotoStats.js';
import { exigirCampeonato } from '../../../../../_lib/campeonato.js';

// GET /api/c/:slug/pilotos/por-nome/:nome -> estatísticas de resultados ainda sem perfil vinculado
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  let nome;
  try {
    nome = decodeURIComponent(context.params.nome).trim();
  } catch {
    nome = context.params.nome.trim();
  }

  const [existeNaoVinculado] = await sql`
    SELECT 1 FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.piloto_id IS NULL AND e.campeonato_id = ${campeonato.id} AND TRIM(r.nome_bruto) ILIKE ${nome}
    LIMIT 1
  `;

  if (!existeNaoVinculado) {
    const [jaVinculado] = await sql`
      SELECT 1 FROM resultados r
      JOIN baterias b ON b.id = r.bateria_id
      JOIN eventos e ON e.id = b.evento_id
      WHERE r.piloto_id IS NOT NULL AND e.campeonato_id = ${campeonato.id} AND TRIM(r.nome_bruto) ILIKE ${nome}
      LIMIT 1
    `;
    if (jaVinculado) {
      return Response.json({ erro: 'Esse resultado já foi vinculado a um perfil.' }, { status: 409 });
    }
    return Response.json({ erro: 'Nenhum resultado encontrado com esse nome.' }, { status: 404 });
  }

  const estatisticas = await obterEstatisticasNaoVinculado(sql, campeonato.id, nome);
  return Response.json({ nome, ...estatisticas });
}
