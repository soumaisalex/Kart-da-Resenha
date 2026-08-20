// Usado tanto ao rejeitar uma reivindicação pendente quanto ao excluir um piloto já
// aprovado: solta os resultados vinculados (voltam a piloto_id = NULL, reaparecendo
// como "não vinculado" no ranking) e remove o registro do piloto, deixando o nome
// livre pra alguém reivindicar de novo do zero.
export async function removerPilotoEDesvincular(sql, id) {
  await sql`UPDATE resultados SET piloto_id = NULL WHERE piloto_id = ${id}`;
  const [piloto] = await sql`DELETE FROM pilotos WHERE id = ${id} RETURNING id, nome`;
  return piloto || null;
}
