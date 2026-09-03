import { getDb } from '../../../_lib/db.js';
import { obterEstatisticasNaoVinculado } from '../../../_lib/pilotoStats.js';

// GET /api/pilotos/por-nome/:nome -> estatísticas de resultados ainda sem perfil vinculado
export async function onRequestGet(context) {
  const sql = getDb(context.env);

  // O parâmetro pode chegar já decodificado (dependendo de como o roteador do Cloudflare
  // trata o segmento dinâmico) ou ainda como %20 etc — decodeURIComponent é seguro nos dois
  // casos: se já estiver decodificado, não muda nada (não tem % pra decodificar de novo).
  let nome;
  try {
    nome = decodeURIComponent(context.params.nome).trim();
  } catch {
    nome = context.params.nome.trim();
  }

  const [existeNaoVinculado] = await sql`
    SELECT e.campeonato_id
    FROM resultados r
    JOIN baterias b ON b.id = r.bateria_id
    JOIN eventos e ON e.id = b.evento_id
    WHERE r.piloto_id IS NULL AND TRIM(r.nome_bruto) ILIKE ${nome}
    LIMIT 1
  `;

  if (!existeNaoVinculado) {
    const [jaVinculado] = await sql`
      SELECT 1 FROM resultados WHERE piloto_id IS NOT NULL AND TRIM(nome_bruto) ILIKE ${nome} LIMIT 1
    `;
    if (jaVinculado) {
      return Response.json({ erro: 'Esse resultado já foi vinculado a um perfil.' }, { status: 409 });
    }
    return Response.json({ erro: 'Nenhum resultado encontrado com esse nome.' }, { status: 404 });
  }

  const estatisticas = await obterEstatisticasNaoVinculado(sql, existeNaoVinculado.campeonato_id, nome);
  return Response.json({ nome, ...estatisticas });
}
