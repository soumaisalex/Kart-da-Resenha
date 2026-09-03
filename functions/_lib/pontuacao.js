// Calcula pontos de um resultado com base na config vigente do campeonato
// (config_pontuacao_posicao + config_geral, agora sempre filtrados por campeonato_id)
export async function calcularPontos(sql, { campeonatoId, posicao, ehVoltaMaisRapida }) {
  const [linhaPosicao] = await sql`
    SELECT pontos FROM config_pontuacao_posicao
    WHERE campeonato_id = ${campeonatoId} AND posicao = ${posicao}
  `;
  const pontosPosicao = linhaPosicao ? Number(linhaPosicao.pontos) : 0;

  let pontosVoltaRapida = 0;
  if (ehVoltaMaisRapida) {
    const [linhaVolta] = await sql`
      SELECT valor FROM config_geral WHERE campeonato_id = ${campeonatoId} AND chave = 'pontos_melhor_volta'
    `;
    pontosVoltaRapida = linhaVolta ? Number(linhaVolta.valor) : 0;
  }

  return { pontosPosicao, pontosVoltaRapida };
}

// Verifica idade mínima (config_geral.idade_minima do campeonato) a partir da data de nascimento
export async function validarIdadeMinima(sql, campeonatoId, dataNascimento) {
  const [linha] = await sql`
    SELECT valor FROM config_geral WHERE campeonato_id = ${campeonatoId} AND chave = 'idade_minima'
  `;
  const idadeMinima = linha ? Number(linha.valor) : 18;

  const nascimento = new Date(dataNascimento);
  const hoje = new Date();
  let idade = hoje.getFullYear() - nascimento.getFullYear();
  const aindaNaoFezAniversario =
    hoje.getMonth() < nascimento.getMonth() ||
    (hoje.getMonth() === nascimento.getMonth() && hoje.getDate() < nascimento.getDate());
  if (aindaNaoFezAniversario) idade--;

  return { valido: idade >= idadeMinima, idade, idadeMinima };
}
