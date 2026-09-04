import { SignJWT, jwtVerify, createRemoteJWKSet } from 'jose';
import { getDb } from '../../_lib/db.js';

const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

// POST /api/auth/google -> { credential: <ID token do Google> }
// Verifica a assinatura do token direto com as chaves públicas do Google (sem precisar
// de client secret nenhum), cria a conta se for a primeira vez, e assina nosso próprio
// cookie de sessão — o mesmo mecanismo que já existia, só que agora baseado em conta
// autenticada pelo Google em vez de usuário/senha.
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { credential } = await context.request.json();

  if (!credential) {
    return Response.json({ erro: 'Credencial do Google não enviada' }, { status: 400 });
  }
  if (!context.env.GOOGLE_CLIENT_ID) {
    return Response.json({ erro: 'GOOGLE_CLIENT_ID não está configurado neste ambiente.' }, { status: 500 });
  }

  let payload;
  try {
    const resultado = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: context.env.GOOGLE_CLIENT_ID
    });
    payload = resultado.payload;
  } catch (e) {
    return Response.json({ erro: 'Token do Google inválido', detalhe: e?.message }, { status: 401 });
  }

  const googleId = payload.sub;
  const email = payload.email;
  const nome = payload.name || null;
  const fotoUrl = payload.picture || null;

  let [conta] = await sql`SELECT id, email, nome, foto_url FROM contas WHERE google_id = ${googleId}`;

  if (!conta) {
    [conta] = await sql`
      INSERT INTO contas (google_id, email, nome, foto_url)
      VALUES (${googleId}, ${email}, ${nome}, ${fotoUrl})
      RETURNING id, email, nome, foto_url
    `;

    // Primeira conta a logar assume o campeonato legado, se ele ainda não tiver dono.
    // Restrito a esse slug específico por segurança — não é uma regra genérica de
    // "quem logar primeiro pega o que estiver sem dono".
    await sql`
      UPDATE campeonatos SET conta_id = ${conta.id}
      WHERE slug = 'kart-da-resenha' AND conta_id IS NULL
    `;
  } else {
    await sql`UPDATE contas SET nome = ${nome}, foto_url = ${fotoUrl} WHERE id = ${conta.id}`;
  }

  const secret = new TextEncoder().encode(context.env.JWT_SECRET);
  const token = await new SignJWT({ contaId: String(conta.id), email: conta.email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('30d')
    .sign(secret);

  return new Response(
    JSON.stringify({ ok: true, conta: { id: conta.id, nome: conta.nome, email: conta.email, foto_url: fotoUrl } }),
    {
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=2592000`
      }
    }
  );
}
