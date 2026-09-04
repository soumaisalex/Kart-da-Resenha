import { verificarSessaoAdmin } from './auth.js';
import { obterCampeonatoPorSlug } from './campeonato.js';

// Resolve o campeonato do slug na URL E confirma que a conta logada é dona dele.
// Isso é o que impede que uma conta administre o campeonato de outra pessoa.
// Uso: const { campeonato, negado } = await exigirDonoCampeonato(context, sql);
//      if (negado) return negado;
export async function exigirDonoCampeonato(context, sql) {
  const sessao = await verificarSessaoAdmin(context);
  if (!sessao) {
    return { campeonato: null, negado: Response.json({ erro: 'Não autenticado' }, { status: 401 }) };
  }

  const { slug } = context.params;
  const campeonato = await obterCampeonatoPorSlug(sql, slug);
  if (!campeonato) {
    return { campeonato: null, negado: Response.json({ erro: 'Campeonato não encontrado' }, { status: 404 }) };
  }

  if (String(campeonato.conta_id) !== String(sessao.contaId)) {
    return { campeonato: null, negado: Response.json({ erro: 'Você não é dono deste campeonato' }, { status: 403 }) };
  }

  return { campeonato, negado: null };
}
