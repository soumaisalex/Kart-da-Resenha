// Uso: node scripts/criar-admin.mjs <usuario> <senha>
// Gera o hash no mesmo formato usado por functions/_lib/senha.js e imprime
// o SQL pronto pra rodar no console do Neon (nunca commitar usuário/senha reais em lugar nenhum).

import { webcrypto } from 'node:crypto';

const ITERACOES = 100000;

async function gerarHash(senha) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const chaveBase = await webcrypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(senha),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const hash = await webcrypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations: ITERACOES, hash: 'SHA-256' },
    chaveBase,
    256
  );

  const saltB64 = Buffer.from(salt).toString('base64');
  const hashB64 = Buffer.from(hash).toString('base64');
  return `${ITERACOES}:${saltB64}:${hashB64}`;
}

const [, , usuario, senha] = process.argv;
if (!usuario || !senha) {
  console.error('Uso: node scripts/criar-admin.mjs <usuario> <senha>');
  process.exit(1);
}

const hash = await gerarHash(senha);
console.log('\nRode este SQL no console do Neon:\n');
console.log(`INSERT INTO admin_usuarios (usuario, senha_hash) VALUES ('${usuario.replace(/'/g, "''")}', '${hash}');\n`);
