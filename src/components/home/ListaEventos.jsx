import { Download, MapPin, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatarDataAbrev } from '../../lib/data.js';

export default function ListaEventos({ eventos }) {
  if (!eventos.length) return null;

  return (
    <div className="space-y-2">
      {eventos.map((evento) => {
        const conteudo = (
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

        return evento.tipo === 'futuro' ? (
          <Link
            key={evento.id}
            to={`/eventos/${evento.id}`}
            className="flex items-center gap-3 px-4 py-3 border border-asfalto-700 rounded-lg hover:bg-asfalto-900 transition-colors"
          >
            {conteudo}
          </Link>
        ) : (
          <div key={evento.id} className="flex items-center gap-3 px-4 py-3 border border-asfalto-700 rounded-lg">
            {conteudo}
          </div>
        );
      })}
    </div>
  );
}
