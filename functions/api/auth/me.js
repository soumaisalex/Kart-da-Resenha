import { verificarSessaoAdmin } from '../../_lib/auth.js';

// GET /api/auth/me -> 200 se autenticado, 401 caso contrário
export async function onRequestGet(context) {
  const payload = await verificarSessaoAdmin(context);
  if (!payload) return Response.json({ autenticado: false }, { status: 401 });
  return Response.json({ autenticado: true, email: payload.email });
}
