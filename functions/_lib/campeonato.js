// Resolve o campeonato a partir do slug na URL. Toda API que vive debaixo de
// /api/c/:slug/... usa isso pra saber em qual campeonato operar antes de tocar
// em qualquer outra tabela (pilotos, eventos, config de pontuação...).
export async function obterCampeonatoPorSlug(sql, slug) {
  const [campeonato] = await sql`
    SELECT id, slug, nome, conta_id FROM campeonatos WHERE slug = ${slug}
  `;
  return campeonato || null;
}

// Helper de conveniência: resolve o campeonato ou já devolve uma Response 404
// pronta pra usar, evitando repetir esse boilerplate em cada endpoint.
// Uso: const { campeonato, negado } = await exigirCampeonato(context, sql);
//      if (negado) return negado;
export async function exigirCampeonato(context, sql) {
  const { slug } = context.params;
  const campeonato = await obterCampeonatoPorSlug(sql, slug);
  if (!campeonato) {
    return { campeonato: null, negado: Response.json({ erro: 'Campeonato não encontrado' }, { status: 404 }) };
  }
  return { campeonato, negado: null };
}
