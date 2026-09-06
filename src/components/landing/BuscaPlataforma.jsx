import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, Trophy, User } from 'lucide-react';

export default function BuscaPlataforma() {
  const [termo, setTermo] = useState('');
  const [resultados, setResultados] = useState(null);
  const [buscando, setBuscando] = useState(false);

  useEffect(() => {
    if (!termo.trim()) {
      setResultados(null);
      return;
    }
    setBuscando(true);
    const espera = setTimeout(() => {
      fetch(`/api/publico/buscar?q=${encodeURIComponent(termo.trim())}`)
        .then((r) => r.json())
        .then(setResultados)
        .catch(() => setResultados({ campeonatos: [], pilotos: [] }))
        .finally(() => setBuscando(false));
    }, 300);
    return () => clearTimeout(espera);
  }, [termo]);

  const temResultados = resultados && (resultados.campeonatos.length > 0 || resultados.pilotos.length > 0);

  return (
    <div className="max-w-lg mx-auto px-4 relative z-10">
      <div className="relative">
        <Search className="w-4 h-4 text-asfalto-600 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Busque um campeonato ou piloto..."
          className="w-full bg-asfalto-900 border border-asfalto-700 rounded-full pl-11 pr-10 py-3
                     text-checkered text-sm placeholder:text-asfalto-600 focus:border-racing outline-none"
        />
        {buscando && (
          <Loader2 className="w-4 h-4 animate-spin text-racing absolute right-4 top-1/2 -translate-y-1/2" />
        )}
      </div>

      {termo.trim() && resultados && (
        <div className="mt-2 bg-asfalto-900 border border-asfalto-700 rounded-xl overflow-hidden divide-y divide-asfalto-700 text-left">
          {!temResultados && (
            <p className="px-4 py-3 text-sm text-asfalto-600">Nada encontrado com esse nome.</p>
          )}

          {resultados.campeonatos.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wide text-asfalto-600">Campeonatos</p>
              {resultados.campeonatos.map((c) => (
                <Link
                  key={c.slug}
                  to={`/c/${c.slug}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-asfalto-800 text-sm text-checkered"
                >
                  <Trophy className="w-4 h-4 text-racing shrink-0" /> {c.nome}
                </Link>
              ))}
            </div>
          )}

          {resultados.pilotos.length > 0 && (
            <div>
              <p className="px-4 pt-3 pb-1 text-[10px] uppercase tracking-wide text-asfalto-600">Pilotos</p>
              {resultados.pilotos.map((p) => (
                <Link
                  key={p.piloto_id}
                  to={`/c/${p.campeonato_slug}/piloto/${p.piloto_id}`}
                  className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-asfalto-800 text-sm"
                >
                  {p.foto_url ? (
                    <img src={p.foto_url} alt="" className="w-6 h-6 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-asfalto-800 flex items-center justify-center shrink-0">
                      <User className="w-3.5 h-3.5 text-asfalto-600" />
                    </div>
                  )}
                  <span className="text-checkered truncate">{p.nome}</span>
                  <span className="text-asfalto-600 text-xs ml-auto shrink-0">{p.campeonato_nome}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
