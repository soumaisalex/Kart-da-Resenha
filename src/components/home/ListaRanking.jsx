import { Link } from 'react-router-dom';
import { User, UserPlus } from 'lucide-react';

export default function ListaRanking({ pilotos }) {
  if (!pilotos.length) return null;

  return (
    <div className="divide-y divide-asfalto-700 border border-asfalto-700 rounded-xl overflow-hidden">
      {pilotos.map((piloto, i) => {
        const destino = piloto.vinculado
          ? `/piloto/${piloto.piloto_id}`
          : `/piloto/nome/${encodeURIComponent(piloto.nome)}`;

        return (
          <Link
            key={piloto.piloto_id ?? piloto.nome}
            to={destino}
            className="flex items-center gap-3 px-4 py-3 hover:bg-asfalto-900 transition-colors"
          >
            <span className="w-7 text-center font-display text-asfalto-600 text-sm">{i + 4}º</span>
            {piloto.foto_url ? (
              <img src={piloto.foto_url} alt={piloto.nome} className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-asfalto-800 flex items-center justify-center">
                {piloto.vinculado ? (
                  <User className="w-4 h-4 text-asfalto-600" />
                ) : (
                  <UserPlus className="w-4 h-4 text-asfalto-600" />
                )}
              </div>
            )}
            <span className="flex-1 min-w-0">
              <span className="block font-medium text-checkered text-sm truncate">{piloto.nome}</span>
              {!piloto.vinculado && (
                <span className="text-[11px] text-asfalto-600">Sem perfil</span>
              )}
            </span>
            <span className="font-display text-sm text-asfalto-600 shrink-0">
              {Number(piloto.pontos_totais)} pts
            </span>
          </Link>
        );
      })}
    </div>
  );
}
