import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, MapPin } from 'lucide-react';
import { formatarDataAbrev } from '../../lib/data.js';

export default function UltimasProvas() {
  const [provas, setProvas] = useState(null);

  useEffect(() => {
    fetch('/api/publico/ultimas-provas')
      .then((r) => r.json())
      .then(setProvas)
      .catch(() => setProvas([]));
  }, []);

  if (!provas || provas.length === 0) return null;

  return (
    <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
      <h2 className="font-display font-semibold text-2xl sm:text-3xl text-checkered text-center mb-2">
        Rolando agora em campeonatos reais
      </h2>
      <p className="text-asfalto-600 text-center mb-10 text-sm">
        Corridas de verdade, gente de verdade — clica e dá uma olhada.
      </p>

      <div className="space-y-3">
        {provas.map((p) => (
          <Link
            key={p.evento_id}
            to={`/c/${p.campeonato_slug}`}
            className="flex items-center gap-4 p-4 rounded-xl border border-asfalto-700
                       hover:border-racing/50 hover:bg-asfalto-900/60 transition-colors"
          >
            <Flag className="w-5 h-5 text-racing shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium text-checkered truncate">
                {p.evento_nome || 'Corrida'} <span className="text-asfalto-600">— {p.campeonato_nome}</span>
              </p>
              <p className="text-xs text-asfalto-600 flex items-center gap-1 flex-wrap">
                {formatarDataAbrev(p.data_evento)}
                {p.local && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {p.local}
                  </span>
                )}
              </p>
            </div>
            {p.vencedor_nome && (
              <div className="text-right shrink-0">
                <p className="text-[10px] uppercase text-asfalto-600">Vencedor</p>
                <p className="text-sm font-display font-semibold text-ouro">{p.vencedor_nome}</p>
              </div>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
