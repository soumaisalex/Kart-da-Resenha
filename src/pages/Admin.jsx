import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, UploadCloud, UserCheck, CalendarClock, Trophy, LayoutGrid } from 'lucide-react';
import ImportarResultados from './admin/ImportarResultados.jsx';
import AprovacaoPerfis from './admin/AprovacaoPerfis.jsx';
import GestaoEventos from './admin/GestaoEventos.jsx';
import ConfiguracaoPontuacao from './admin/ConfiguracaoPontuacao.jsx';

const ABAS = [
  { id: 'importar', label: 'Importar resultados', icone: UploadCloud, Componente: ImportarResultados },
  { id: 'perfis', label: 'Pilotos', icone: UserCheck, Componente: AprovacaoPerfis },
  { id: 'eventos', label: 'Eventos', icone: CalendarClock, Componente: GestaoEventos },
  { id: 'pontuacao', label: 'Pontuação', icone: Trophy, Componente: ConfiguracaoPontuacao }
];

export default function Admin() {
  const [abaAtiva, setAbaAtiva] = useState('importar');
  const AbaAtual = ABAS.find((a) => a.id === abaAtiva)?.Componente;

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/painel';
  }

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-start justify-between mb-6">
        <h1 className="font-display font-bold text-2xl text-checkered">Área Administrativa</h1>
        <div className="flex items-center gap-4">
          <Link
            to="/painel"
            className="flex items-center gap-1.5 text-sm text-asfalto-600 hover:text-checkered"
          >
            <LayoutGrid className="w-4 h-4" /> Meus campeonatos
          </Link>
          <button
            onClick={sair}
            className="flex items-center gap-1.5 text-sm text-asfalto-600 hover:text-checkered"
          >
            <LogOut className="w-4 h-4" /> Sair
          </button>
        </div>
      </div>

      <nav className="flex gap-1 border-b border-asfalto-700 mb-8 overflow-x-auto">
        {ABAS.map(({ id, label, icone: Icone }) => (
          <button
            key={id}
            onClick={() => setAbaAtiva(id)}
            className={`
              flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors shrink-0
              ${abaAtiva === id
                ? 'border-racing text-checkered'
                : 'border-transparent text-asfalto-600 hover:text-checkered'}
            `}
          >
            <Icone className="w-4 h-4" />
            {label}
          </button>
        ))}
      </nav>

      {AbaAtual && <AbaAtual />}
    </main>
  );
}
