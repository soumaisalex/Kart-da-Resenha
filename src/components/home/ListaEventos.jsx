import { useState } from 'react';
import { Download, MapPin, Calendar, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatarDataAbrev } from '../../lib/data.js';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function ListaEventos({ eventos }) {
  const { apiUrl, rota } = useCampeonato();
  const [expandido, setExpandido] = useState(null);
  const [detalhePorEvento, setDetalhePorEvento] = useState({});

  if (!eventos.length) return null;

  async function alternarExpandido(evento) {
    if (expandido === evento.id) {
      setExpandido(null);
      return;
    }
    setExpandido(evento.id);
    if (!detalhePorEvento[evento.id]) {
      try {
        const resp = await fetch(apiUrl(`/eventos/${evento.id}`));
        if (resp.ok) {
          const dados = await resp.json();
          setDetalhePorEvento((atual) => ({ ...atual, [evento.id]: dados }));
        }
      } catch {
        // silencioso — o estado "carregando" só continua exibido, sem quebrar a página
      }
    }
  }

  return (
    <div className="space-y-2">
      {eventos.map((evento) => {
        const linha = (
          <>
            <Calendar className="w-4 h-4 text-asfalto-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-checkered truncate">{evento.nome || 'Corrida'}</p>
              <p className="text-xs text-asfalto-600 flex items-center gap-1 flex-wrap">
                {formatarDataAbrev(evento.data_evento)}
                {evento.local && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {evento.local}
                  </span>
                )}
              </p>
            </div>
            <span
              className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${
                evento.tipo === 'passado' ? 'bg-asfalto-800 text-asfalto-600' : 'bg-racing/15 text-racing'
              }`}
            >
              {evento.tipo === 'passado' ? 'Realizada' : 'Agendada'}
            </span>
            {evento.arquivo_original_url && (
              <a
                href={evento.arquivo_original_url}
                download
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-xs text-racing hover:text-racing-light shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Baixar
              </a>
            )}
          </>
        );

        // Evento futuro: leva pra tela de confirmação de presença
        if (evento.tipo === 'futuro') {
          return (
            <Link
              key={evento.id}
              to={rota(`/eventos/${evento.id}`)}
              className="flex items-center gap-3 px-4 py-3 border border-asfalto-700 rounded-lg hover:bg-asfalto-900 transition-colors"
            >
              {linha}
            </Link>
          );
        }

        // Evento passado: expande na própria página mostrando posição/nome/pontos
        const aberto = expandido === evento.id;
        const detalhe = detalhePorEvento[evento.id];
        const temResultados = detalhe?.baterias?.some((b) => b.resultados.length > 0);

        return (
          <div key={evento.id} className="border border-asfalto-700 rounded-lg overflow-hidden">
            <div
              role="button"
              tabIndex={0}
              onClick={() => alternarExpandido(evento)}
              onKeyDown={(e) => e.key === 'Enter' && alternarExpandido(evento)}
              className="flex items-center gap-3 px-4 py-3 hover:bg-asfalto-900 transition-colors cursor-pointer"
            >
              {linha}
              {aberto ? (
                <ChevronUp className="w-4 h-4 text-asfalto-600 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-asfalto-600 shrink-0" />
              )}
            </div>

            {aberto && (
              <div className="px-4 pb-4">
                {!detalhe ? (
                  <Loader2 className="w-4 h-4 animate-spin text-racing" />
                ) : !temResultados ? (
                  <p className="text-xs text-asfalto-600">Nenhum resultado registrado.</p>
                ) : (
                  <div className="space-y-3">
                    {detalhe.baterias.map(
                      (bateria) =>
                        bateria.resultados.length > 0 && (
                          <div key={bateria.id}>
                            {bateria.descricao && (
                              <p className="text-xs text-asfalto-600 mb-1">{bateria.descricao}</p>
                            )}
                            <div className="space-y-1">
                              {bateria.resultados.map((r) => (
                                <div key={r.id} className="flex items-center gap-3 text-sm">
                                  <span className="w-6 text-asfalto-600 font-display shrink-0">{r.posicao}º</span>
                                  <span className="flex-1 text-checkered truncate">{r.piloto_nome || r.nome_bruto}</span>
                                  <span className="text-racing text-xs font-display shrink-0">
                                    {Number(r.pontos_posicao) + Number(r.pontos_volta_rapida)} pts
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
