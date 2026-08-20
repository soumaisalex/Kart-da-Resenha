import { CalendarClock, Flag, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatarData } from '../../lib/data.js';

export default function AgendaEventos({ ultimoPassado, proximoFuturo }) {
  if (!ultimoPassado && !proximoFuturo) return null;

  return (
    <div className="space-y-3">
      {ultimoPassado && (
        <div className="bg-asfalto-900 border border-asfalto-700 rounded-xl px-5 py-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Flag className="w-5 h-5 text-asfalto-600 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-asfalto-600">Última corrida</p>
              <p className="font-display font-semibold text-checkered">
                {ultimoPassado.nome || ultimoPassado.local || 'Corrida'}
              </p>
              <p className="text-sm text-asfalto-600">
                {formatarData(ultimoPassado.data_evento)}
                {ultimoPassado.local ? ` · ${ultimoPassado.local}` : ''}
              </p>
            </div>
          </div>
          {ultimoPassado.arquivo_original_url && (
            <a
              href={ultimoPassado.arquivo_original_url}
              download
              className="flex items-center justify-center gap-1 w-full sm:w-auto text-sm text-racing hover:text-racing-light shrink-0"
            >
              <Download className="w-4 h-4" /> Baixar
            </a>
          )}
        </div>
      )}

      {proximoFuturo && (
        <div className="bg-racing/10 border border-racing/40 rounded-xl px-5 py-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <CalendarClock className="w-5 h-5 text-racing shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide text-racing">Próxima corrida</p>
              <p className="font-display font-semibold text-checkered">
                {proximoFuturo.nome || proximoFuturo.local || 'Corrida marcada'}
              </p>
              <p className="text-sm text-asfalto-600">
                {formatarData(proximoFuturo.data_evento)}
                {proximoFuturo.local ? ` · ${proximoFuturo.local}` : ''}
              </p>
            </div>
          </div>
          <Link
            to={`/eventos/${proximoFuturo.id}`}
            className="flex items-center justify-center w-full sm:w-auto text-sm font-medium text-checkered
                       bg-racing hover:bg-racing-dark px-4 py-2 rounded-lg shrink-0"
          >
            Confirmar presença
          </Link>
        </div>
      )}
    </div>
  );
}
