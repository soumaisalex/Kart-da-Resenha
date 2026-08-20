import { useEffect, useState } from 'react';
import { Loader2, Plus, ChevronDown, ChevronUp, User, MapPin, Pencil, Trash2 } from 'lucide-react';
import { formatarData } from '../../lib/data.js';
import { msParaTempo } from '../../lib/tempo.js';
import EditarEventoModal from './EditarEventoModal.jsx';

export default function GestaoEventos() {
  const [eventos, setEventos] = useState(null);
  const [form, setForm] = useState({ nome: '', data_evento: '', local: '' });
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [detalhePorEvento, setDetalhePorEvento] = useState({});
  const [eventoEditando, setEventoEditando] = useState(null);
  const [excluindo, setExcluindo] = useState(null);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const resp = await fetch('/api/eventos');
    setEventos(await resp.json());
  }

  async function criarEvento(e) {
    e.preventDefault();
    setErro(null);
    if (!form.data_evento) {
      setErro('Data é obrigatória.');
      return;
    }
    setCriando(true);
    try {
      const resp = await fetch('/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível criar o evento');
      setForm({ nome: '', data_evento: '', local: '' });
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setCriando(false);
    }
  }

  async function alternarExpandido(evento) {
    if (expandido === evento.id) {
      setExpandido(null);
      return;
    }
    setExpandido(evento.id);
    if (!detalhePorEvento[evento.id]) {
      const resp = await fetch(`/api/eventos/${evento.id}`);
      const dados = await resp.json();
      setDetalhePorEvento((atual) => ({ ...atual, [evento.id]: dados }));
    }
  }

  async function excluirEvento(evento) {
    const confirmar = window.confirm(
      `Excluir o evento "${evento.nome || evento.local || 'sem nome'}" (${formatarData(evento.data_evento)})?\n\n` +
      'Isso apaga todos os resultados e confirmações de presença vinculados a ele. Essa ação não pode ser desfeita.'
    );
    if (!confirmar) return;

    setExcluindo(evento.id);
    try {
      const resp = await fetch(`/api/eventos/${evento.id}`, { method: 'DELETE' });
      if (!resp.ok) throw new Error('Não foi possível excluir o evento');
      setEventos((atual) => atual.filter((e) => e.id !== evento.id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setExcluindo(null);
    }
  }

  function eventoAtualizado(atualizado) {
    setEventos((atual) => atual.map((e) => (e.id === atualizado.id ? { ...e, ...atualizado } : e)));
    setDetalhePorEvento((atual) => ({ ...atual, [atualizado.id]: { ...atual[atualizado.id], ...atualizado } }));
    setEventoEditando(null);
  }

  const futuros = (eventos || []).filter((e) => e.tipo === 'futuro');
  const passados = (eventos || []).filter((e) => e.tipo === 'passado');

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-display font-semibold text-xl text-checkered mb-1">Novo evento futuro</h2>
        <p className="text-asfalto-600 mb-4 text-sm">
          Pilotos poderão confirmar presença assim que você criar aqui.
        </p>

        <form onSubmit={criarEvento} className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
          <Campo label="Nome (opcional)" valor={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
          <Campo label="Data" tipo="date" valor={form.data_evento} onChange={(v) => setForm({ ...form, data_evento: v })} obrigatorio />
          <Campo label="Local" valor={form.local} onChange={(v) => setForm({ ...form, local: v })} />
          <button
            type="submit"
            disabled={criando}
            className="sm:col-span-3 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-racing
                       hover:bg-racing-dark text-checkered font-display font-semibold w-fit disabled:opacity-60"
          >
            {criando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Criar evento
          </button>
        </form>
        {erro && <p className="text-racing-light text-sm mt-2">{erro}</p>}
      </div>

      <div>
        <h2 className="font-display font-semibold text-xl text-checkered mb-3">Próximos eventos</h2>
        {eventos === null && <Loader2 className="w-4 h-4 animate-spin text-racing" />}
        {eventos !== null && futuros.length === 0 && (
          <p className="text-asfalto-600 text-sm">Nenhum evento futuro cadastrado.</p>
        )}
        <div className="space-y-2">
          {futuros.map((evento) => (
            <EventoLinha
              key={evento.id}
              evento={evento}
              expandido={expandido === evento.id}
              detalhe={detalhePorEvento[evento.id]}
              excluindo={excluindo === evento.id}
              onToggle={() => alternarExpandido(evento)}
              onEditar={() => setEventoEditando(evento)}
              onExcluir={() => excluirEvento(evento)}
            />
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display font-semibold text-xl text-checkered mb-3">Eventos realizados</h2>
        {eventos !== null && passados.length === 0 && (
          <p className="text-asfalto-600 text-sm">Nenhum evento com resultado importado ainda.</p>
        )}
        <div className="space-y-2">
          {passados.map((evento) => (
            <EventoLinha
              key={evento.id}
              evento={evento}
              expandido={expandido === evento.id}
              detalhe={detalhePorEvento[evento.id]}
              excluindo={excluindo === evento.id}
              onToggle={() => alternarExpandido(evento)}
              onEditar={() => setEventoEditando(evento)}
              onExcluir={() => excluirEvento(evento)}
            />
          ))}
        </div>
      </div>

      {eventoEditando && (
        <EditarEventoModal
          evento={eventoEditando}
          onFechar={() => setEventoEditando(null)}
          onSalvo={eventoAtualizado}
        />
      )}
    </div>
  );
}

function EventoLinha({ evento, expandido, detalhe, excluindo, onToggle, onEditar, onExcluir }) {
  return (
    <div className="border border-asfalto-700 rounded-lg overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 hover:bg-asfalto-900">
        <button onClick={onToggle} className="flex-1 flex items-center gap-3 text-left min-w-0">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-checkered truncate">{evento.nome || 'Corrida'}</p>
            <p className="text-xs text-asfalto-600 flex items-center gap-1">
              {formatarData(evento.data_evento)}
              {evento.local && <><MapPin className="w-3 h-3 ml-1" /> {evento.local}</>}
            </p>
          </div>
          {expandido ? <ChevronUp className="w-4 h-4 text-asfalto-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-asfalto-600 shrink-0" />}
        </button>
        <button onClick={onEditar} className="text-asfalto-600 hover:text-checkered shrink-0" aria-label="Editar evento">
          <Pencil className="w-4 h-4" />
        </button>
        <button onClick={onExcluir} disabled={excluindo} className="text-asfalto-600 hover:text-racing-light shrink-0 disabled:opacity-60" aria-label="Excluir evento">
          {excluindo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
        </button>
      </div>

      {expandido && (
        <div className="px-4 pb-4 space-y-4">
          {!detalhe ? (
            <Loader2 className="w-4 h-4 animate-spin text-racing" />
          ) : (
            <>
              {evento.tipo === 'futuro' && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-asfalto-600 mb-2">
                    {detalhe.confirmados.length} confirmado{detalhe.confirmados.length !== 1 ? 's' : ''}
                  </p>
                  {detalhe.confirmados.length === 0 ? (
                    <p className="text-xs text-asfalto-600">Ninguém confirmou ainda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {detalhe.confirmados.map((c) => (
                        <PilotoChip key={c.id} nome={c.nome} foto_url={c.foto_url} />
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detalhe.baterias?.length > 0 && (
                <div className="space-y-3">
                  <p className="text-xs uppercase tracking-wide text-asfalto-600">Resultados</p>
                  {detalhe.baterias.map((bateria) => (
                    <div key={bateria.id}>
                      {bateria.descricao && (
                        <p className="text-xs text-asfalto-600 mb-1">{bateria.descricao}</p>
                      )}
                      <div className="space-y-1">
                        {bateria.resultados.map((r) => (
                          <div key={r.id} className="flex items-center gap-3 text-sm">
                            <span className="w-6 text-asfalto-600 font-display shrink-0">{r.posicao}º</span>
                            <span className="flex-1 text-checkered truncate">{r.piloto_nome || r.nome_bruto}</span>
                            {r.melhor_volta_ms && (
                              <span className="text-asfalto-600 text-xs shrink-0">{msParaTempo(r.melhor_volta_ms)}</span>
                            )}
                            <span className="text-racing text-xs font-display shrink-0 w-12 text-right">
                              {Number(r.pontos_posicao) + Number(r.pontos_volta_rapida)} pts
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {evento.tipo === 'passado' && !detalhe.baterias?.length && (
                <p className="text-xs text-asfalto-600">Nenhum resultado importado pra esse evento.</p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function PilotoChip({ nome, foto_url }) {
  return (
    <div className="flex items-center gap-1.5 bg-asfalto-800 rounded-full pl-1 pr-3 py-1">
      {foto_url ? (
        <img src={foto_url} alt={nome} className="w-6 h-6 rounded-full object-cover" />
      ) : (
        <div className="w-6 h-6 rounded-full bg-asfalto-700 flex items-center justify-center">
          <User className="w-3 h-3 text-asfalto-600" />
        </div>
      )}
      <span className="text-xs text-checkered">{nome}</span>
    </div>
  );
}

function Campo({ label, valor, onChange, tipo = 'text', obrigatorio }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-asfalto-600">{label}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        required={obrigatorio}
        className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
      />
    </label>
  );
}
