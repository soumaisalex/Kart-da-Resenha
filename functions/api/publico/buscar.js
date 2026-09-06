import { getDb } from '../../_lib/db.js';

// GET /api/publico/buscar?q=termo -> { campeonatos: [...], pilotos: [...] }
// Busca pública, sem autenticação — só considera pilotos aprovados e não ocultos.
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const termo = (new URL(context.request.url).searchParams.get('q') || '').trim();

  if (!termo) {
    return Response.json({ campeonatos: [], pilotos: [] });
  }

  const like = `%${termo}%`;

  const campeonatos = await sql`
    SELECT slug, nome FROM campeonatos
    WHERE nome ILIKE ${like}
    ORDER BY nome
    LIMIT 6
  `;

  const pilotos = await sql`
    SELECT p.id AS piloto_id, p.nome, p.foto_url, c.slug AS campeonato_slug, c.nome AS campeonato_nome
    FROM pilotos p
    JOIN campeonatos c ON c.id = p.campeonato_id
    WHERE p.status = 'aprovado' AND p.oculto = false AND p.nome ILIKE ${like}
    ORDER BY p.nome
    LIMIT 6
  `;

  return Response.json({ campeonatos, pilotos });
}
