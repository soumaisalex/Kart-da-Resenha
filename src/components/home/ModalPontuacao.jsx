import { useEffect, useState } from 'react';
import { X, Loader2, Zap, Trophy } from 'lucide-react';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function ModalPontuacao({ onFechar }) {
  const { apiUrl } = useCampeonato();
  const [config, setConfig] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    fetch(apiUrl('/config/pontuacao'))
      .then((r) => r.json())
      .then(setConfig)
      .catch(() => setErro('Não foi possível carregar a pontuação agora.'));
  }, [apiUrl]);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-asfalto-900 border border-asfalto-700 rounded-xl p-6 relative max-h-[85vh] overflow-y-auto">
        <button onClick={onFechar} className="absolute top-4 right-4 text-asfalto-600 hover:text-checkered">
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Trophy className="w-5 h-5 text-racing" />
          <h2 className="font-display font-semibold text-lg text-checkered">Como funciona a pontuação</h2>
        </div>
        <p className="text-sm text-asfalto-600 mb-5">
          Cada bateria dá pontos por posição de chegada — quanto melhor a colocação, mais pontos.
          Esses pontos se somam ao longo das corridas pra formar o ranking geral e o da temporada.
        </p>

        {erro && <p className="text-racing-light text-sm">{erro}</p>}

        {!config && !erro && (
          <div className="flex items-center gap-2 text-asfalto-600 text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        )}

        {config && (
          <>
            <div className="space-y-1 mb-5">
              {config.posicoes
                .sort((a, b) => a.posicao - b.posicao)
                .map((linha) => (
                  <div key={linha.posicao} className="flex items-center justify-between text-sm">
                    <span className="text-checkered">{linha.posicao}º lugar</span>
                    <span className="font-display font-semibold text-racing">{Number(linha.pontos)} pts</span>
                  </div>
                ))}
            </div>

            <div className="flex items-start gap-3 bg-racing/10 border border-racing/40 rounded-lg px-4 py-3">
              <Zap className="w-5 h-5 text-racing shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-checkered font-medium">Ponto extra: volta mais rápida</p>
                <p className="text-xs text-asfalto-600 mt-0.5">
                  Quem fizer a volta mais rápida de cada bateria ganha{' '}
                  <strong className="text-racing">+{Number(config.pontos_melhor_volta)} pontos</strong> bônus,
                  além dos pontos da posição — independente de qual colocação tenha terminado.
                </p>
              </div>
            </div>

            <p className="text-xs text-asfalto-600 mt-5">
              Essa tabela pode mudar ao longo do tempo — o que vale pra cada corrida é a pontuação
              configurada no momento em que os resultados dela foram importados.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
