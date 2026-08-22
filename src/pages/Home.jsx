import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Flag, HelpCircle } from 'lucide-react';
import Podio from '../components/home/Podio.jsx';
import DestaqueVoltaRapida from '../components/home/DestaqueVoltaRapida.jsx';
import ListaRanking from '../components/home/ListaRanking.jsx';
import AgendaEventos from '../components/home/AgendaEventos.jsx';
import ListaEventos from '../components/home/ListaEventos.jsx';
import ModalPontuacao from '../components/home/ModalPontuacao.jsx';

export default function Home() {
  const [ranking, setRanking] = useState(null);
  const [destaque, setDestaque] = useState(null);
  const [eventos, setEventos] = useState(null);
  const [modalPontuacao, setModalPontuacao] = useState(false);

  
  // AQUI INICIA O TESTE
  
// Exemplo de como montar o link com os dados do piloto logado
const montarUrlCalendly = (piloto) => {
  const baseUrl = "https://calendly.com/piquetkartaracaju/reservar-horario-piquet-kart/2026-08-23T19:00:00-03:00";
  
  const params = new URLSearchParams({
    month: "2026-08",
    date: "2026-08-23",
    name: piloto?.nome || "",
    email: piloto?.email || "",
    // 'a1', 'a2', etc. correspondem às perguntas personalizadas do formulário
    a1: piloto?.telefone || "", 
    a2: piloto?.data_nascimento || "" 
  });

  return `${baseUrl}?${params.toString()}`;
};

  export function BotaoAgendarCorrida({ pilotoLogado }) {
  const [modalAberto, setModalAberto] = useState(false);

  // Carrega o script do widget do Calendly dinamicamente
  useEffect(() => {
    if (modalAberto) {
      const script = document.createElement('script');
      script.src = 'https://assets.calendly.com/assets/external/widget.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [modalAberto]);

  // Monta a URL passando os dados do piloto logado no banco
  const urlComDados = `https://calendly.com/piquetkartaracaju/reservar-horario-piquet-kart/2026-08-23T19:00:00-03:00?month=2026-08&date=2026-08-23&name=${encodeURIComponent(pilotoLogado?.nome || '')}&email=${encodeURIComponent(pilotoLogado?.email || '')}&a1=${encodeURIComponent(pilotoLogado?.telefone || '')}`;

  return (
    <div className="w-full flex justify-center my-4">
      {/* Botão posicionado na página inicial */}
      <button
        onClick={() => setModalAberto(true)}
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors shadow-lg text-sm"
      >
        Confirmar participação na próxima corrida
      </button>

      {/* Modal Iframe sobreposto na tela */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4">
          <div className="relative w-full max-w-3xl bg-zinc-900 rounded-xl overflow-hidden shadow-2xl border border-zinc-800">
            <div className="flex justify-between items-center p-3 border-b border-zinc-800 bg-zinc-950">
              <span className="text-sm font-semibold text-zinc-300">Reserva de Horário - Kart</span>
              <button
                onClick={() => setModalAberto(false)}
                className="text-zinc-400 hover:text-white font-bold px-2 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="h-[600px] w-full">
              <div
                className="calendly-inline-widget w-full h-full"
                data-url={urlComDados}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
  // AQUI ENCERRA O TESTE
  
  useEffect(() => {
    fetch('/api/ranking').then((r) => r.json()).then(setRanking).catch(() => setRanking([]));
    fetch('/api/eventos/ultima-corrida')
      .then((r) => (r.ok ? r.json() : null))
      .then(setDestaque)
      .catch(() => setDestaque(null));
    fetch('/api/eventos').then((r) => r.json()).then(setEventos).catch(() => setEventos([]));
  }, []);

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
          Kart da Resenha
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
        <Link to="/reivindicar" className="text-sm text-asfalto-600 hover:text-racing">
          Correu com a gente e não tem perfil? Reivindicar meu perfil
        </Link>
      </footer>

      {modalPontuacao && <ModalPontuacao onFechar={() => setModalPontuacao(false)} />}
    </main>
  );
}
