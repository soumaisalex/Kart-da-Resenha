import { Link } from 'react-router-dom';
import { User } from 'lucide-react';

export default function ListaRanking({ pilotos }) {
  if (!pilotos.length) return null;

  return (
    <div className="divide-y divide-asfalto-700 border border-asfalto-700 rounded-xl overflow-hidden">
      {pilotos.map((piloto, i) => (
        <Link
          key={piloto.piloto_id}
          to={`/piloto/${piloto.piloto_id}`}
          className="flex items-center gap-3 px-4 py-3 hover:bg-asfalto-900 transition-colors"
        >
          <span className="w-7 text-center font-display text-asfalto-600 text-sm">{i + 4}º</span>
          {piloto.foto_url ? (
            <img src={piloto.foto_url} alt={piloto.nome} className="w-9 h-9 rounded-full object-cover" />
          ) : (
            <div className="w-9 h-9 rounded-full bg-asfalto-800 flex items-center justify-center">
              <User className="w-4 h-4 text-asfalto-600" />
            </div>
          )}
          <span className="flex-1 font-medium text-checkered text-sm truncate">{piloto.nome}</span>
          <span className="font-display text-sm text-asfalto-600 shrink-0">
            {Number(piloto.pontos_totais)} pts
          </span>
        </Link>
      ))}
    </div>
  );
}
