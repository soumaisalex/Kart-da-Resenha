import { Link } from 'react-router-dom';
import { Trophy, UserPlus } from 'lucide-react';

const ALTURA = { 1: 'h-36 sm:h-44', 2: 'h-24 sm:h-32', 3: 'h-16 sm:h-24' };
const ORDEM_VISUAL = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };
const COR_TEXTO = { 1: 'text-ouro', 2: 'text-prata', 3: 'text-bronze' };
const COR_BORDA = { 1: 'border-ouro', 2: 'border-prata', 3: 'border-bronze' };

export default function Podio({ top3 }) {
  if (!top3.length) return null;

  return (
    <div className="flex items-end justify-center gap-4 sm:gap-8">
      {top3.map((piloto, i) => {
        const posicao = i + 1;
        const destino = piloto.vinculado
          ? `/piloto/${piloto.piloto_id}`
          : `/piloto/nome/${encodeURIComponent(piloto.nome)}`;

        return (
          <Link
            key={piloto.piloto_id ?? piloto.nome}
            to={destino}
            className={`flex flex-col items-center ${ORDEM_VISUAL[posicao]} group`}
          >
            {piloto.foto_url ? (
              <img
                src={piloto.foto_url}
                alt={piloto.nome}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-4 ${COR_BORDA[posicao]} -mb-2 z-10 group-hover:scale-105 transition-transform`}
              />
            ) : (
              <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-asfalto-800 border-4 ${COR_BORDA[posicao]} -mb-2 z-10 flex items-center justify-center group-hover:scale-105 transition-transform`}>
                {piloto.vinculado ? (
                  <Trophy className={`w-6 h-6 ${COR_TEXTO[posicao]}`} />
                ) : (
                  <UserPlus className="w-6 h-6 text-asfalto-600" />
                )}
              </div>
            )}

            <p className="font-display font-semibold text-checkered text-sm sm:text-base text-center mt-1 max-w-[6.5rem] truncate">
              {piloto.nome}
            </p>
            <p className={`font-display text-xs sm:text-sm ${COR_TEXTO[posicao]} mb-2`}>
              {Number(piloto.pontos_totais)} pts
            </p>
            {!piloto.vinculado && (
              <span className="text-[10px] text-asfalto-600 border border-asfalto-600 rounded-full px-2 py-0.5 -mt-1 mb-2">
                Sem perfil
              </span>
            )}

            <div
              className={`relative w-20 sm:w-28 ${ALTURA[posicao]} rounded-t-md bg-asfalto-800
                          border-x border-asfalto-700 flex items-start justify-center pt-3 overflow-hidden`}
            >
              <div className="absolute top-0 left-0 right-0 h-2 bg-[repeating-linear-gradient(90deg,#ff3b30_0_10px,#f5f5f0_10px_20px)]" />
              <span className="font-display font-bold text-3xl text-asfalto-600">{posicao}º</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
