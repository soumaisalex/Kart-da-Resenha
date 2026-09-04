import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Flag, HelpCircle } from 'lucide-react';
import Podio from '../components/home/Podio.jsx';
import DestaqueVoltaRapida from '../components/home/DestaqueVoltaRapida.jsx';
import ListaRanking from '../components/home/ListaRanking.jsx';
import AgendaEventos from '../components/home/AgendaEventos.jsx';
import ListaEventos from '../components/home/ListaEventos.jsx';
import ModalPontuacao from '../components/home/ModalPontuacao.jsx';
import { useCampeonato } from '../context/CampeonatoContext.jsx';

export default function Home() {
  const { apiUrl, rota } = useCampeonato();
  const [campeonato, setCampeonato] = useState(null);
  const [ranking, setRanking] = useState(null);
  const [destaque, setDestaque] = useState(null);
  const [eventos, setEventos] = useState(null);
  const [modalPontuacao, setModalPontuacao] = useState(false);

  useEffect(() => {
    fetch(apiUrl('')).then((r) => (r.ok ? r.json() : null)).then(setCampeonato).catch(() => setCampeonato(null));
    fetch(apiUrl('/ranking')).then((r) => r.json()).then(setRanking).catch(() => setRanking([]));
    fetch(apiUrl('/eventos/ultima-corrida'))
      .then((r) => (r.ok ? r.json() : null))
      .then(setDestaque)
      .catch(() => setDestaque(null));
    fetch(apiUrl('/eventos')).then((r) => r.json()).then(setEventos).catch(() => setEventos([]));
  }, [apiUrl]);

  const carregando = ranking === null || eventos === null;

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-racing" />
      </div>
    );
  }

  const top3 = ranking.slice(0, 3);
  const resto = ranking.slice(3);
  const passados = eventos.filter((e) => e.tipo === 'passado'); // já vem ordenado por data desc da API
  const futuros = [...eventos.filter((e) => e.tipo === 'futuro')]
    .sort((a, b) => new Date(a.data_evento) - new Date(b.data_evento));
  const ultimoPassado = passados[0] || null;
  const proximoFuturo = futuros[0] || null;

  return (
    <main className="max-w-3xl mx-auto px-4 py-10 space-y-12">
      <header className="flex items-center gap-2 justify-center">
        <Flag className="w-6 h-6 text-racing" />
        <h1 className="font-display font-bold text-2xl sm:text-3xl text-checkered tracking-wide">
          {campeonato?.nome || 'Carregando...'}
        </h1>
      </header>

      {top3.length > 0 ? (
        <section>
          <Podio top3={top3} />
          <div className="flex justify-center mt-4">
            <button
              onClick={() => setModalPontuacao(true)}
              className="flex items-center gap-1 text-xs text-asfalto-600 hover:text-racing"
            >
              <HelpCircle className="w-3.5 h-3.5" /> Como funciona a pontuação?
            </button>
          </div>
        </section>
      ) : (
        <p className="text-center text-asfalto-600">
          Ainda não há corridas suficientes pra formar o ranking.
        </p>
      )}

      {destaque && (
        <section>
          <DestaqueVoltaRapida destaque={destaque} />
        </section>
      )}

      {resto.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-checkered mb-3">Classificação geral</h2>
          <ListaRanking pilotos={resto} />
        </section>
      )}

      {(ultimoPassado || proximoFuturo) && (
        <section>
          <h2 className="font-display font-semibold text-checkered mb-3">Agenda</h2>
          <AgendaEventos ultimoPassado={ultimoPassado} proximoFuturo={proximoFuturo} />
        </section>
      )}

      {eventos.length > 0 && (
        <section>
          <h2 className="font-display font-semibold text-checkered mb-3">Todos os eventos</h2>
          <ListaEventos eventos={eventos} />
        </section>
      )}

      <footer className="text-center pt-4">
        <Link to={rota('/reivindicar')} className="text-sm text-asfalto-600 hover:text-racing">
          Correu com a gente e não tem perfil? Reivindicar meu perfil
        </Link>
      </footer>

      {modalPontuacao && <ModalPontuacao onFechar={() => setModalPontuacao(false)} />}
    </main>
  );
}
