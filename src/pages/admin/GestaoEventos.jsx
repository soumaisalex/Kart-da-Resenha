import { useEffect, useState } from 'react';
import { Loader2, Plus, ChevronDown, ChevronUp, User, MapPin } from 'lucide-react';

function formatarData(data) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export default function GestaoEventos() {
  const [eventos, setEventos] = useState(null);
  const [form, setForm] = useState({ nome: '', data_evento: '', local: '' });
  const [criando, setCriando] = useState(false);
  const [erro, setErro] = useState(null);
  const [expandido, setExpandido] = useState(null);
  const [confirmadosPorEvento, setConfirmadosPorEvento] = useState({});

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
    if (!confirmadosPorEvento[evento.id]) {
      const resp = await fetch(`/api/eventos/${evento.id}`);
      const dados = await resp.json();
      setConfirmadosPorEvento((atual) => ({ ...atual, [evento.id]: dados.confirmados }));
    }
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
            <div key={evento.id} className="border border-asfalto-700 rounded-lg overflow-hidden">
              <button
                onClick={() => alternarExpandido(evento)}
                className="w-full flex items-center gap-3 px-4 py-3 hover:bg-asfalto-900 text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-checkered truncate">{evento.nome || 'Corrida'}</p>
                  <p className="text-xs text-asfalto-600 flex items-center gap-1">
                    {formatarData(evento.data_evento)}
                    {evento.local && <><MapPin className="w-3 h-3 ml-1" /> {evento.local}</>}
                  </p>
                </div>
                {expandido === evento.id ? <ChevronUp className="w-4 h-4 text-asfalto-600" /> : <ChevronDown className="w-4 h-4 text-asfalto-600" />}
              </button>

              {expandido === evento.id && (
                <div className="px-4 pb-4">
                  {!confirmadosPorEvento[evento.id] ? (
                    <Loader2 className="w-4 h-4 animate-spin text-racing" />
                  ) : confirmadosPorEvento[evento.id].length === 0 ? (
                    <p className="text-xs text-asfalto-600">Ninguém confirmou ainda.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {confirmadosPorEvento[evento.id].map((c) => (
                        <div key={c.id} className="flex items-center gap-1.5 bg-asfalto-800 rounded-full pl-1 pr-3 py-1">
                          {c.foto_url ? (
                            <img src={c.foto_url} alt={c.nome} className="w-6 h-6 rounded-full object-cover" />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-asfalto-700 flex items-center justify-center">
                              <User className="w-3 h-3 text-asfalto-600" />
                            </div>
                          )}
                          <span className="text-xs text-checkered">{c.nome}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
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
            <div key={evento.id} className="flex items-center gap-3 px-4 py-3 border border-asfalto-700 rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-checkered truncate">{evento.nome || 'Corrida'}</p>
                <p className="text-xs text-asfalto-600 flex items-center gap-1">
                  {formatarData(evento.data_evento)}
                  {evento.local && <><MapPin className="w-3 h-3 ml-1" /> {evento.local}</>}
                </p>
              </div>
              {evento.arquivo_original_url && (
                <a href={evento.arquivo_original_url} download className="text-xs text-racing hover:text-racing-light shrink-0">
                  Baixar arquivo
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
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
