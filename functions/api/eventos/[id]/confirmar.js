import { getDb } from '../../../_lib/db.js';
import { validarIdadeMinima } from '../../../_lib/pontuacao.js';

// POST /api/eventos/:id/confirmar
// body: { piloto_id, data_nascimento? }
// Regras:
// - só piloto com status = 'aprovado' pode confirmar
// - se o piloto ainda não tem data_nascimento salva, é obrigatória agora; valida idade mínima
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { id: eventoId } = context.params;
  const { piloto_id, data_nascimento } = await context.request.json();

  const [piloto] = await sql`SELECT status, data_nascimento FROM pilotos WHERE id = ${piloto_id}`;
  if (!piloto) return Response.json({ erro: 'Piloto não encontrado' }, { status: 404 });
  if (piloto.status !== 'aprovado') {
    return Response.json({ erro: 'Perfil ainda não aprovado — não é possível confirmar presença' }, { status: 403 });
  }

  let dataParaValidar = piloto.data_nascimento;
  if (!dataParaValidar) {
    if (!data_nascimento) {
      return Response.json({ erro: 'Data de nascimento é obrigatória na primeira confirmação' }, { status: 400 });
    }
    dataParaValidar = data_nascimento;
  }

  const { valido, idade, idadeMinima } = await validarIdadeMinima(sql, dataParaValidar);
  if (!valido) {
    return Response.json({ erro: `Idade mínima de ${idadeMinima} anos (idade informada: ${idade})` }, { status: 403 });
  }

  // Salva data de nascimento no perfil se ainda não tinha
  if (!piloto.data_nascimento) {
    await sql`UPDATE pilotos SET data_nascimento = ${data_nascimento} WHERE id = ${piloto_id}`;
  }

  const [confirmacao] = await sql`
    INSERT INTO confirmacoes (evento_id, piloto_id)
    VALUES (${eventoId}, ${piloto_id})
    ON CONFLICT (evento_id, piloto_id) DO NOTHING
    RETURNING id, evento_id, piloto_id, confirmado_em
  `;

  return Response.json(confirmacao ?? { info: 'Presença já estava confirmada' });
}
