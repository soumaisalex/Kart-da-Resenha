import { jwtVerify } from 'jose';

// Retorna o payload do token se a sessão for válida, ou null caso contrário
export async function verificarSessaoAdmin(context) {
  const cookieHeader = context.request.headers.get('Cookie') || '';
  const match = cookieHeader.match(/admin_session=([^;]+)/);
  if (!match) return null;

  try {
    const secret = new TextEncoder().encode(context.env.JWT_SECRET);
    const { payload } = await jwtVerify(match[1], secret);
    return payload;
  } catch {
    return null;
  }
}

// Uso no início de qualquer endpoint que só o admin pode chamar:
//   const negado = await exigirAdmin(context);
//   if (negado) return negado;
export async function exigirAdmin(context) {
  const payload = await verificarSessaoAdmin(context);
  if (!payload) {
    return Response.json({ erro: 'Não autenticado' }, { status: 401 });
  }
  return null;
}
