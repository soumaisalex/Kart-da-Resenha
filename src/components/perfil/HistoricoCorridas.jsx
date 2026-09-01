import { formatarDataNumerica } from '../../lib/data.js';

export default function HistoricoCorridas({ historico }) {
  if (!historico?.length) return null;

  // Mais recente primeiro — o gráfico de evolução (mais abaixo) já cobre a leitura cronológica
  const linhas = [...historico].reverse();

  return (
    <div>
      <h2 className="font-display font-semibold text-checkered mb-3">Histórico</h2>
      <div className="space-y-2.5">
        {linhas.map((corrida, i) => {
          const titulo = corrida.bateria_descricao || corrida.evento_nome || 'Corrida';
          const temBonus = Number(corrida.pontos_volta_rapida) > 0;

          return (
            <div key={`${corrida.evento_id}-${i}`}>
              <div className="flex items-baseline gap-2">
                <span className="text-checkered text-sm truncate">
                  {titulo} ({formatarDataNumerica(corrida.data_evento)})
                </span>
                <span className="flex-1 border-b border-dotted border-asfalto-700 mb-1" />
                <span className="text-racing font-display font-semibold text-sm shrink-0">
                  {Number(corrida.pontos_posicao)} pts
                </span>
              </div>

              {temBonus && (
                <div className="flex items-baseline gap-2 pl-3 mt-0.5">
                  <span className="text-asfalto-600 text-xs truncate">Volta mais rápida</span>
                  <span className="flex-1 border-b border-dotted border-asfalto-800 mb-0.5" />
                  <span className="text-ouro font-display font-semibold text-xs shrink-0">
                    +{Number(corrida.pontos_volta_rapida)} pts
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
