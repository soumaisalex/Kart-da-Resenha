import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, CalendarClock, MapPin, ArrowLeft, CheckCircle2, User, AlertTriangle } from 'lucide-react';
import { formatarData } from '../lib/data.js';
import { useCampeonato } from '../context/CampeonatoContext.jsx';

export default function EventoDetalhe() {
  const { id } = useParams();
  const { apiUrl, rota } = useCampeonato();
  const [evento, setEvento] = useState(null);
  const [erroCarregar, setErroCarregar] = useState(null);

  const [pilotos, setPilotos] = useState([]);
  const [pilotoSelecionadoId, setPilotoSelecionadoId] = useState('');
  const [precisaNascimento, setPrecisaNascimento] = useState(false);
  const [dataNascimento, setDataNascimento] = useState('');
  const [confirmando, setConfirmando] = useState(false);
  const [erroConfirmar, setErroConfirmar] = useState(null);
  const [jaConfirmado, setJaConfirmado] = useState(false);

  useEffect(() => {
    carregarEvento();
    fetch(apiUrl('/pilotos')).then((r) => r.json()).then(setPilotos).catch(() => {});
  }, [id]);

  async function carregarEvento() {
    setErroCarregar(null);
    try {
      const resp = await fetch(apiUrl(`/eventos/${id}`));
      if (!resp.ok) throw new Error('Evento não encontrado');
      setEvento(await resp.json());
    } catch (e) {
      setErroCarregar(e.message);
    }
  }

  async function selecionarPiloto(pilotoId) {
    setPilotoSelecionadoId(pilotoId);
    setErroConfirmar(null);
    setDataNascimento('');
    setJaConfirmado(false);
    if (!pilotoId) return;

    const jaEsta = evento?.confirmados?.some((c) => String(c.id) === String(pilotoId));
    setJaConfirmado(!!jaEsta);
    if (jaEsta) return;

    // Checa se esse piloto já tem data de nascimento cadastrada
    try {
      const resp = await fetch(apiUrl(`/pilotos/${pilotoId}`));
      const dados = await resp.json();
      setPrecisaNascimento(!dados.tem_data_nascimento);
    } catch {
      setPrecisaNascimento(true);
    }
  }

  async function confirmar(e) {
    e.preventDefault();
    setErroConfirmar(null);

    if (!pilotoSelecionadoId) {
      setErroConfirmar('Selecione quem você é na lista.');
      return;
    }
    if (precisaNascimento && !dataNascimento) {
      setErroConfirmar('Informe sua data de nascimento pra confirmar.');
      return;
    }

    setConfirmando(true);
    try {
      const resp = await fetch(apiUrl(`/eventos/${id}/confirmar`), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          piloto_id: Number(pilotoSelecionadoId),
          data_nascimento: precisaNascimento ? dataNascimento : undefined
        })
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível confirmar presença');

      setJaConfirmado(true);
      carregarEvento();
    } catch (e) {
      setErroConfirmar(e.message);
    } finally {
      setConfirmando(false);
    }
  }

  if (erroCarregar) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-checkered">{erroCarregar}</p>
        <Link to={rota('/')} className="text-racing hover:text-racing-light text-sm mt-3 inline-block">Voltar pra Home</Link>
      </main>
    );
  }

  if (!evento) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-racing" />
      </div>
    );
  }

  const vagasRestantes =
    evento.limite_vagas != null ? Math.max(0, evento.limite_vagas - evento.confirmados.length) : null;
  const lotado = vagasRestantes === 0;

  return (
    <main className="max-w-md mx-auto px-4 py-10 space-y-6">
      <Link to={rota('/')} className="flex items-center gap-1.5 text-sm text-asfalto-600 hover:text-checkered w-fit">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="text-center space-y-1">
        <CalendarClock className="w-8 h-8 text-racing mx-auto" />
        <h1 className="font-display font-bold text-xl text-checkered">{evento.nome || 'Corrida marcada'}</h1>
        <p className="text-asfalto-600 text-sm">{formatarData(evento.data_evento)}</p>
        {evento.local && (
          <p className="flex items-center justify-center gap-1 text-asfalto-600 text-sm">
            <MapPin className="w-3.5 h-3.5" /> {evento.local}
          </p>
        )}
      </div>

      {/* Lista de confirmados */}
      <div>
        <div className="flex items-baseline justify-between gap-2 mb-2">
          <h2 className="font-display font-semibold text-checkered text-sm">
            {evento.confirmados.length} confirmado{evento.confirmados.length !== 1 ? 's' : ''}
          </h2>
          {evento.limite_vagas != null && (
            <span className={`text-xs font-display ${vagasRestantes === 0 ? 'text-racing' : 'text-asfalto-600'}`}>
              {vagasRestantes === 0
                ? 'Vagas esgotadas'
                : `${vagasRestantes} vaga${vagasRestantes !== 1 ? 's' : ''} restante${vagasRestantes !== 1 ? 's' : ''}`}
              <span className="text-asfalto-600"> · {evento.confirmados.length}/{evento.limite_vagas}</span>
            </span>
          )}
        </div>

        {evento.limite_vagas != null && (
          <div className="h-1.5 bg-asfalto-800 rounded-full overflow-hidden mb-3">
            <div
              className={vagasRestantes === 0 ? 'h-full bg-racing' : 'h-full bg-checkered/40'}
              style={{ width: `${Math.min(100, (evento.confirmados.length / evento.limite_vagas) * 100)}%` }}
            />
          </div>
        )}

        {evento.confirmados.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {evento.confirmados.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5 bg-asfalto-900 border border-asfalto-700 rounded-full pl-1 pr-3 py-1">
                {c.foto_url ? (
                  <img src={c.foto_url} alt={c.nome} className="w-6 h-6 rounded-full object-cover" />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-asfalto-800 flex items-center justify-center">
                    <User className="w-3 h-3 text-asfalto-600" />
                  </div>
                )}
                <span className="text-xs text-checkered">{c.nome}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-asfalto-600">Ninguém confirmou ainda — seja o primeiro!</p>
        )}
      </div>

      {/* Confirmação */}
      <div className="border-t border-asfalto-700 pt-5">
        {jaConfirmado ? (
          <div className="flex items-center gap-2 text-checkered bg-racing/10 border border-racing/40 rounded-lg px-4 py-3">
            <CheckCircle2 className="w-5 h-5 text-racing shrink-0" />
            <span className="text-sm">Presença confirmada!</span>
          </div>
        ) : lotado ? (
          <div className="flex items-start gap-2 text-checkered bg-asfalto-800 border border-asfalto-700 rounded-lg px-4 py-3">
            <AlertTriangle className="w-5 h-5 text-racing shrink-0 mt-0.5" />
            <div className="text-sm">
              <p>Todas as {evento.limite_vagas} vagas dessa corrida já foram preenchidas.</p>
              <p className="text-asfalto-600 text-xs mt-1">
                Fala com quem organiza — pode ser que abra vaga ou que role outra bateria.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={confirmar} className="space-y-3">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-asfalto-600">Quem é você?</span>
              <select
                value={pilotoSelecionadoId}
                onChange={(e) => selecionarPiloto(e.target.value)}
                className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
                required
              >
                <option value="">Selecione seu perfil</option>
                {pilotos.map((p) => (
                  <option key={p.id} value={p.id}>{p.nome}</option>
                ))}
              </select>
            </label>

            <p className="text-xs text-asfalto-600">
              Vai ser sua primeira vez ou ainda não reivindicou seu perfil?{' '}
              <Link to={rota('/reivindicar')} className="text-racing hover:text-racing-light">
                Cadastre-se aqui
              </Link>{' '}
              antes de confirmar.
            </p>

            {precisaNascimento && pilotoSelecionadoId && (
              <label className="flex flex-col gap-1 text-sm">
                <span className="text-asfalto-600">Data de nascimento (confirmamos idade mínima)</span>
                <input
                  type="date"
                  value={dataNascimento}
                  onChange={(e) => setDataNascimento(e.target.value)}
                  className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
                  required
                />
              </label>
            )}

            {erroConfirmar && (
              <p className="flex items-center gap-2 text-racing-light text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" /> {erroConfirmar}
              </p>
            )}

            <button
              type="submit"
              disabled={confirmando}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-racing
                         hover:bg-racing-dark text-checkered font-display font-semibold disabled:opacity-60"
            >
              {confirmando && <Loader2 className="w-4 h-4 animate-spin" />}
              Confirmar presença
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
