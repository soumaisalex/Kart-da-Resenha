import { msParaTempo } from '../../lib/tempo.js';
import GraficoEvolucao from './GraficoEvolucao.jsx';

export default function EstatisticasPiloto({ dados }) {
  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Estatistica valor={dados.stats?.total_corridas ?? 0} label="corridas" />
        <Estatistica valor={Number(dados.stats?.pontos_totais ?? 0)} label="pontos" />
        <Estatistica
          valor={dados.stats?.melhor_volta_ms ? msParaTempo(dados.stats.melhor_volta_ms) : '--'}
          label="melhor volta"
        />
        <Estatistica
          valor={dados.stats?.vel_media_media ? `${Number(dados.stats.vel_media_media).toFixed(1)} km/h` : '--'}
          label="vel. média"
        />
      </div>

      <div className="space-y-2">
        <h2 className="font-display font-semibold text-checkered">Rankings</h2>
        <RankingLinha titulo="Geral" ranking={dados.ranking_geral} />
        <RankingLinha titulo="Temporada atual" ranking={dados.ranking_temporada} />
        {dados.ultimo_evento && (
          <RankingLinha
            titulo={`Última corrida: ${dados.ultimo_evento.nome || ''}`}
            ranking={{ posicao: dados.ultimo_evento.posicao, total_pilotos: dados.ultimo_evento.total_pilotos }}
          />
        )}
      </div>

      {dados.historico?.length > 0 && (
        <div>
          <h2 className="font-display font-semibold text-checkered mb-3">Evolução</h2>
          <GraficoEvolucao historico={dados.historico} />
        </div>
      )}
    </>
  );
}

function Estatistica({ valor, label }) {
  return (
    <div className="bg-asfalto-900 border border-asfalto-700 rounded-lg py-3 text-center">
      <p className="font-display font-bold text-checkered text-lg">{valor}</p>
      <p className="text-[11px] uppercase tracking-wide text-asfalto-600">{label}</p>
    </div>
  );
}

function RankingLinha({ titulo, ranking }) {
  if (!ranking?.posicao) return null;
  return (
    <div className="flex items-center justify-between bg-asfalto-900 border border-asfalto-700 rounded-lg px-4 py-2.5">
      <span className="text-sm text-checkered truncate">{titulo}</span>
      <span className="font-display font-semibold text-racing shrink-0 ml-3">
        {ranking.posicao}º <span className="text-asfalto-600 font-normal">de {ranking.total_pilotos}</span>
      </span>
    </div>
  );
}
