import { getDb } from '../../_lib/db.js';
import { obterEstatisticasPiloto } from '../../_lib/pilotoStats.js';
import { verificarSessaoAdmin } from '../../_lib/auth.js';

// GET /api/pilotos/:id -> dados + estatísticas completas do piloto (perfil público)
export async function onRequestGet(context) {
  const sql = getDb(context.env);
  const { id } = context.params;

  const [piloto] = await sql`
    SELECT id, nome, foto_url, instagram, status, oculto, (data_nascimento IS NOT NULL) AS tem_data_nascimento
    FROM pilotos WHERE id = ${id}
  `;
  if (!piloto) return Response.json({ erro: 'Piloto não encontrado' }, { status: 404 });

  const estatisticas = await obterEstatisticasPiloto(sql, id);

  return Response.json({ ...piloto, ...estatisticas });
}

// PATCH /api/pilotos/:id -> editar dados do perfil
// body: { ultimos4Telefone, ...camposParaAtualizar }
// Trava: exige ultimos4Telefone batendo com o telefone salvo (padrão Novos Chilenos) —
// EXCETO se a requisição vier de uma sessão admin autenticada, aí a edição é livre.
export async function onRequestPatch(context) {
  const sql = getDb(context.env);
  const { id } = context.params;
  const body = await context.request.json();

  const sessaoAdmin = await verificarSessaoAdmin(context);

  const [piloto] = await sql`SELECT telefone FROM pilotos WHERE id = ${id}`;
  if (!piloto) return Response.json({ erro: 'Piloto não encontrado' }, { status: 404 });

  if (!sessaoAdmin) {
    const ultimos4Salvo = (piloto.telefone || '').replace(/\D/g, '').slice(-4);
    if (!body.ultimos4Telefone || body.ultimos4Telefone !== ultimos4Salvo) {
      return Response.json({ erro: 'Verificação por telefone inválida' }, { status: 403 });
    }
  }

  const [atualizado] = await sql`
    UPDATE pilotos SET
      nome = COALESCE(${body.nome}, nome),
      email = COALESCE(${body.email}, email),
      instagram = COALESCE(${body.instagram}, instagram),
      foto_url = COALESCE(${body.foto_url}, foto_url),
      atualizado_em = now()
    WHERE id = ${id}
    RETURNING id, nome, email, instagram, foto_url
  `;

  return Response.json(atualizado);
}
