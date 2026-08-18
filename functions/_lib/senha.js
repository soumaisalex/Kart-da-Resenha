const ITERACOES = 100000;

export async function gerarHashSenha(senha) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivar(senha, salt, ITERACOES);
  return `${ITERACOES}:${bufParaBase64(salt)}:${bufParaBase64(hash)}`;
}

export async function verificarSenha(senha, hashArmazenado) {
  if (!hashArmazenado) return false;
  const [iteracoesStr, saltB64, hashB64] = hashArmazenado.split(':');
  if (!iteracoesStr || !saltB64 || !hashB64) return false;

  const salt = base64ParaBuf(saltB64);
  const hashEsperado = base64ParaBuf(hashB64);
  const hashCalculado = new Uint8Array(await derivar(senha, salt, Number(iteracoesStr)));

  return compararConstante(hashCalculado, hashEsperado);
}

async function derivar(senha, salt, iteracoes) {
  const chaveBase = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  return crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: iteracoes, hash: 'SHA-256' },
    chaveBase,
    256
  );
}

function bufParaBase64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}
function base64ParaBuf(b64) {
  return Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
}
function compararConstante(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}
