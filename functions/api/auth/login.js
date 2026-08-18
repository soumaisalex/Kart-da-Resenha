import { SignJWT } from 'jose';
import { getDb } from '../../_lib/db.js';

// POST /api/auth/login -> { usuario, senha } -> cookie HttpOnly com JWT assinado
// TODO: senha_hash deve ser gerada com PBKDF2/Web Crypto (mesmo padrão do xContas), não texto puro.
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { usuario, senha } = await context.request.json();

  const [admin] = await sql`SELECT id, usuario, senha_hash FROM admin_usuarios WHERE usuario = ${usuario}`;
  if (!admin) return Response.json({ erro: 'Credenciais inválidas' }, { status: 401 });

  // TODO: comparar hash real (placeholder abaixo)
  const senhaValida = await verificarSenha(senha, admin.senha_hash);
  if (!senhaValida) return Response.json({ erro: 'Credenciais inválidas' }, { status: 401 });

  const secret = new TextEncoder().encode(context.env.JWT_SECRET);
  const token = await new SignJWT({ sub: String(admin.id), usuario: admin.usuario })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    }
  });
}

async function verificarSenha(senha, hash) {
  // TODO: implementar PBKDF2 (Web Crypto) igual ao xContas
  return false;
}
