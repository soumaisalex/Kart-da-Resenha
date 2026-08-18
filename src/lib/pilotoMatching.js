// Normaliza pra comparação: minúsculas, sem acento, sem espaços duplicados
export function normalizarTexto(texto) {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Distância de Levenshtein simples — suficiente pro tamanho de lista que esse projeto tem
function distancia(a, b) {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

// Retorna o piloto mais parecido da lista (ou null), com um score de confiança 0-1
export function sugerirPiloto(nomeBruto, pilotos) {
  const alvo = normalizarTexto(nomeBruto);
  let melhor = null;
  let melhorScore = 0;

  for (const piloto of pilotos) {
    const candidato = normalizarTexto(piloto.nome);
    const maxLen = Math.max(alvo.length, candidato.length) || 1;
    const score = 1 - distancia(alvo, candidato) / maxLen;
    if (score > melhorScore) {
      melhorScore = score;
      melhor = piloto;
    }
  }

  // Só sugere automaticamente se a confiança for razoável — abaixo disso, deixa em branco
  return melhorScore >= 0.6 ? { piloto: melhor, score: melhorScore } : null;
}
