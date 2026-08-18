// Converte "mm:ss.mmm" ou "hh:mm:ss.mmm" (como vem do OCR) para milissegundos.
// Retorna null se não conseguir interpretar — a tela de revisão sinaliza pro admin corrigir.
export function tempoParaMs(texto) {
  if (!texto || typeof texto !== 'string') return null;
  const limpo = texto.trim().replace(',', '.');
  const partes = limpo.split(':');

  try {
    if (partes.length === 3) {
      const [h, m, s] = partes;
      return (Number(h) * 3600 + Number(m) * 60 + Number(s)) * 1000;
    }
    if (partes.length === 2) {
      const [m, s] = partes;
      return (Number(m) * 60 + Number(s)) * 1000;
    }
    if (partes.length === 1) {
      return Number(partes[0]) * 1000;
    }
  } catch {
    return null;
  }
  return null;
}

// Converte milissegundos de volta para "mm:ss.mmm" — usado pra exibir/editar na tabela
export function msParaTempo(ms) {
  if (ms == null || Number.isNaN(ms)) return '';
  const totalMs = Math.round(ms);
  const minutos = Math.floor(totalMs / 60000);
  const segundos = Math.floor((totalMs % 60000) / 1000);
  const milis = totalMs % 1000;
  return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}.${String(milis).padStart(3, '0')}`;
}
