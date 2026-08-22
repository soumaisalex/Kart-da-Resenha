import { getDb } from '../../../_lib/db.js';
import { obterEstatisticasNaoVinculado } from '../../../_lib/pilotoStats.js';

// GET /api/pilotos/por-nome/:nome -> estatísticas de resultados ainda sem perfil vinculado
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const nome = context.params.nome;

  const [existeNaoVinculado] = await sql`
    SELECT 1 FROM resultados WHERE piloto_id IS NULL AND nome_bruto ILIKE ${nome} LIMIT 1
  `;

  if (!existeNaoVinculado) {
    const [jaVinculado] = await sql`
      SELECT 1 FROM resultados WHERE piloto_id IS NOT NULL AND nome_bruto ILIKE ${nome} LIMIT 1
    `;
    if (jaVinculado) {
      return Response.json({ erro: 'Esse resultado já foi vinculado a um perfil.' }, { status: 409 });
    }
    return Response.json({ erro: 'Nenhum resultado encontrado com esse nome.' }, { status: 404 });
  }

  const estatisticas = await obterEstatisticasNaoVinculado(sql, nome);
  return Response.json({ nome, ...estatisticas });
}
