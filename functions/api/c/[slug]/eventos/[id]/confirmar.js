import { getDb } from '../../../../../_lib/db.js';
import { validarIdadeMinima } from '../../../../../_lib/pontuacao.js';
import { exigirCampeonato } from '../../../../../_lib/campeonato.js';

// POST /api/c/:slug/eventos/:id/confirmar
// body: { piloto_id, data_nascimento? }
export async function onRequestPost(context) {
  const sql = getDb(context.env);
  const { campeonato, negado } = await exigirCampeonato(context, sql);
  if (negado) return negado;

  const { id: eventoId } = context.params;
  const { piloto_id, data_nascimento } = await context.request.json();

  const [evento] = await sql`SELECT id FROM eventos WHERE id = ${eventoId} AND campeonato_id = ${campeonato.id}`;
  if (!evento) return Response.json({ erro: 'Evento não encontrado' }, { status: 404 });

  const [piloto] = await sql`
    SELECT status, data_nascimento FROM pilotos WHERE id = ${piloto_id} AND campeonato_id = ${campeonato.id}
  `;
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

  const { valido, idade, idadeMinima } = await validarIdadeMinima(sql, campeonato.id, dataParaValidar);
  if (!valido) {
    return Response.json({ erro: `Idade mínima de ${idadeMinima} anos (idade informada: ${idade})` }, { status: 403 });
  }

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
