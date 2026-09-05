import { Trophy } from 'lucide-react';

const EXEMPLO = [
  { nome: 'Marina Off', pontos: 87, posicao: 1 },
  { nome: 'Diego Reis', pontos: 74, posicao: 2 },
  { nome: 'Bia Ferraz', pontos: 68, posicao: 3 }
];

const ALTURA = { 1: 'h-28 sm:h-32', 2: 'h-20 sm:h-24', 3: 'h-14 sm:h-16' };
const ORDEM_VISUAL = { 1: 'order-2', 2: 'order-1', 3: 'order-3' };
const COR_TEXTO = { 1: 'text-ouro', 2: 'text-prata', 3: 'text-bronze' };
const COR_BORDA = { 1: 'border-ouro', 2: 'border-prata', 3: 'border-bronze' };

export default function PodioIlustrativo() {
  return (
    <div className="flex items-end justify-center gap-3 sm:gap-6">
      {EXEMPLO.map((piloto) => (
        <div key={piloto.posicao} className={`flex flex-col items-center ${ORDEM_VISUAL[piloto.posicao]}`}>
          <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-asfalto-800 border-4 ${COR_BORDA[piloto.posicao]} -mb-2 z-10 flex items-center justify-center`}>
            <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${COR_TEXTO[piloto.posicao]}`} />
          </div>
          <p className="font-display font-semibold text-checkered text-xs sm:text-sm text-center mt-1">
            {piloto.nome}
          </p>
          <p className={`font-display text-xs ${COR_TEXTO[piloto.posicao]} mb-2`}>{piloto.pontos} pts</p>
          <div
            className={`relative w-14 sm:w-20 ${ALTURA[piloto.posicao]} rounded-t-md bg-asfalto-800
                        border-x border-asfalto-700 flex items-start justify-center pt-2 overflow-hidden`}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-[repeating-linear-gradient(90deg,#ff3b30_0_8px,#f5f5f0_8px_16px)]" />
            <span className="font-display font-bold text-xl sm:text-2xl text-asfalto-600">{piloto.posicao}º</span>
          </div>
        </div>
      ))}
    </div>
  );
}
