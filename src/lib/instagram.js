export function linkInstagram(valor) {
  if (!valor) return null;
  const limpo = valor.trim();
  if (/^https?:\/\//i.test(limpo)) return limpo;
  const usuario = limpo.replace(/^@/, '').replace(/^instagram\.com\//i, '');
  return `https://instagram.com/${usuario}`;
}
