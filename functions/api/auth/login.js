import { SignJWT } from 'jose';
import { getDb } from '../../_lib/db.js';
import { verificarSenha } from '../../_lib/senha.js';

// POST /api/auth/login -> { usuario, senha } -> cookie HttpOnly com JWT assinado (7 dias)
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { usuario, senha } = await context.request.json();

  if (!usuario || !senha) {
    return Response.json({ erro: 'Usuário e senha são obrigatórios' }, { status: 400 });
  }

  const [admin] = await sql`SELECT id, usuario, senha_hash FROM admin_usuarios WHERE usuario = ${usuario}`;
  if (!admin) return Response.json({ erro: 'Credenciais inválidas' }, { status: 401 });

  const senhaValida = await verificarSenha(senha, admin.senha_hash);
  if (!senhaValida) return Response.json({ erro: 'Credenciais inválidas' }, { status: 401 });

  const secret = new TextEncoder().encode(context.env.JWT_SECRET);
  const token = await new SignJWT({ sub: String(admin.id), usuario: admin.usuario })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret);

  return new Response(JSON.stringify({ ok: true, usuario: admin.usuario }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`
    }
  });
}
