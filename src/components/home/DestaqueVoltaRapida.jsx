import { Link } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { msParaTempo } from '../../lib/tempo.js';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function DestaqueVoltaRapida({ destaque }) {
  const { rota } = useCampeonato();
  if (!destaque) return null;
  const nome = destaque.piloto_nome || destaque.nome_bruto;

  const conteudo = (
    <div className="flex items-center gap-4 bg-asfalto-900 border border-racing/40 rounded-xl px-5 py-4">
      <div className="w-10 h-10 rounded-full bg-racing/15 flex items-center justify-center shrink-0">
        <Zap className="w-5 h-5 text-racing" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs uppercase tracking-wide text-asfalto-600">
          Volta mais rápida — {destaque.evento_nome || 'última corrida'}
        </p>
        <p className="font-display font-semibold text-checkered truncate">{nome}</p>
      </div>
      <p className="font-display font-bold text-xl text-racing shrink-0">
        {msParaTempo(destaque.melhor_volta_ms)}
      </p>
    </div>
  );

  return destaque.piloto_id ? (
    <Link to={rota(`/piloto/${destaque.piloto_id}`)} className="block hover:opacity-90 transition-opacity">
      {conteudo}
    </Link>
  ) : (
    conteudo
  );
}
