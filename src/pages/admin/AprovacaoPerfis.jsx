import { useEffect, useState } from 'react';
import { Check, X, Loader2, User, Phone, Mail, Instagram, Inbox, Eye, EyeOff, Pencil } from 'lucide-react';
import EditarPerfilAdminModal from './EditarPerfilAdminModal.jsx';

export default function AprovacaoPerfis() {
  const [pendentes, setPendentes] = useState(null); // null = carregando
  const [aprovados, setAprovados] = useState(null);
  const [processando, setProcessando] = useState(null); // id em ação no momento
  const [erro, setErro] = useState(null);
  const [pilotoEditando, setPilotoEditando] = useState(null);

  useEffect(() => {
    carregarPendentes();
    carregarAprovados();
  }, []);

  async function carregarPendentes() {
    setErro(null);
    try {
      const resp = await fetch('/api/pilotos/pendentes');
      if (!resp.ok) throw new Error('Não foi possível carregar a fila de aprovação');
      setPendentes(await resp.json());
    } catch (e) {
      setErro(e.message);
      setPendentes([]);
    }
  }

  async function carregarAprovados() {
    try {
      const resp = await fetch('/api/pilotos/gerenciar');
      if (!resp.ok) throw new Error('Não foi possível carregar os perfis aprovados');
      setAprovados(await resp.json());
    } catch (e) {
      setAprovados([]);
    }
  }

  async function decidir(id, acao) {
    setProcessando(id);
    try {
      const resp = await fetch('/api/pilotos/pendentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, acao })
      });
      if (!resp.ok) throw new Error('Não foi possível concluir a ação');
      setPendentes((atual) => atual.filter((p) => p.id !== id));
      if (acao === 'aprovar') carregarAprovados();
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
  }

  async function alternarOculto(piloto) {
    setProcessando(piloto.id);
    try {
      const resp = await fetch('/api/pilotos/gerenciar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: piloto.id, oculto: !piloto.oculto })
      });
      if (!resp.ok) throw new Error('Não foi possível atualizar a visibilidade');
      const atualizado = await resp.json();
      setAprovados((atual) => atual.map((p) => (p.id === atualizado.id ? { ...p, oculto: atualizado.oculto } : p)));
    } catch (e) {
      setErro(e.message);
    } finally {
      setProcessando(null);
    }
  }

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display font-semibold text-xl text-checkered mb-1">Aprovação de perfis</h2>
        <p className="text-asfalto-600 mb-6">Pilotos que reivindicaram o próprio perfil e aguardam aprovação</p>

        {erro && <p className="text-racing-light text-sm mb-4">{erro}</p>}

        {pendentes === null && (
          <div className="flex items-center gap-2 text-asfalto-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        )}

        {pendentes?.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-10 text-asfalto-600">
            <Inbox className="w-8 h-8" />
            <p>Nenhum perfil aguardando aprovação no momento.</p>
          </div>
        )}

        <div className="space-y-3">
          {pendentes?.map((piloto) => (
            <div
              key={piloto.id}
              className="flex items-center gap-4 bg-asfalto-900 border border-asfalto-700 rounded-xl p-4"
            >
              {piloto.foto_url ? (
                <img src={piloto.foto_url} alt={piloto.nome} className="w-14 h-14 rounded-full object-cover" />
              ) : (
                <div className="w-14 h-14 rounded-full bg-asfalto-800 flex items-center justify-center">
                  <User className="w-6 h-6 text-asfalto-600" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-display font-semibold text-checkered">{piloto.nome}</p>
                <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-1 text-xs text-asfalto-600">
                  {piloto.telefone && (
                    <span className="flex items-center gap-1"><Phone className="w-3 h-3" /> {piloto.telefone}</span>
                  )}
                  {piloto.email && (
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {piloto.email}</span>
                  )}
                  {piloto.instagram && (
                    <span className="flex items-center gap-1"><Instagram className="w-3 h-3" /> {piloto.instagram}</span>
                  )}
                </div>
              </div>

              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => decidir(piloto.id, 'aprovar')}
                  disabled={processando === piloto.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-racing hover:bg-racing-dark
                             text-checkered text-sm font-medium disabled:opacity-60"
                >
                  {processando === piloto.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                  Aprovar
                </button>
                <button
                  onClick={() => decidir(piloto.id, 'rejeitar')}
                  disabled={processando === piloto.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-asfalto-600
                             text-checkered text-sm hover:bg-asfalto-800 disabled:opacity-60"
                >
                  <X className="w-4 h-4" /> Rejeitar
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-xl text-checkered mb-1">Perfis aprovados</h2>
        <p className="text-asfalto-600 mb-6 text-sm">
          Ocultar um perfil o remove do ranking, das pontuações e das listas públicas — sem apagar o histórico dele.
        </p>

        {aprovados === null && (
          <div className="flex items-center gap-2 text-asfalto-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        )}

        <div className="space-y-2">
          {aprovados?.map((piloto) => (
            <div
              key={piloto.id}
              className={`flex items-center gap-3 px-4 py-3 border rounded-lg ${
                piloto.oculto ? 'border-asfalto-700 opacity-60' : 'border-asfalto-700'
              }`}
            >
              {piloto.foto_url ? (
                <img src={piloto.foto_url} alt={piloto.nome} className="w-9 h-9 rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-asfalto-800 flex items-center justify-center">
                  <User className="w-4 h-4 text-asfalto-600" />
                </div>
              )}
              <span className="flex-1 text-sm text-checkered truncate">{piloto.nome}</span>
              {piloto.oculto && (
                <span className="text-xs text-asfalto-600 border border-asfalto-600 rounded-full px-2 py-0.5">
                  Oculto
                </span>
              )}
              <button
                onClick={() => setPilotoEditando(piloto)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-asfalto-600
                           text-checkered text-sm hover:bg-asfalto-800 shrink-0"
              >
                <Pencil className="w-4 h-4" /> Editar
              </button>
              <button
                onClick={() => alternarOculto(piloto)}
                disabled={processando === piloto.id}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-asfalto-600
                           text-checkered text-sm hover:bg-asfalto-800 disabled:opacity-60 shrink-0"
              >
                {processando === piloto.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : piloto.oculto ? (
                  <Eye className="w-4 h-4" />
                ) : (
                  <EyeOff className="w-4 h-4" />
                )}
                {piloto.oculto ? 'Mostrar' : 'Ocultar'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {pilotoEditando && (
        <EditarPerfilAdminModal
          piloto={pilotoEditando}
          onFechar={() => setPilotoEditando(null)}
          onSalvo={(atualizado) => {
            setAprovados((atual) =>
              atual.map((p) => (p.id === atualizado.id ? { ...p, ...atualizado } : p))
            );
            setPilotoEditando(null);
          }}
        />
      )}
    </div>
  );
}
