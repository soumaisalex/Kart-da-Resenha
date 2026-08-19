import { CalendarClock, Flag, Download } from 'lucide-react';

function formatarData(data) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric'
  });
}

export default function AgendaEventos({ ultimoPassado, proximoFuturo }) {
  if (!ultimoPassado && !proximoFuturo) return null;

  return (
    <div className="space-y-3">
      {ultimoPassado && (
        <div className="flex items-center gap-4 bg-asfalto-900 border border-asfalto-700 rounded-xl px-5 py-4">
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
          {ultimoPassado.arquivo_original_url && (
            <a
              href={ultimoPassado.arquivo_original_url}
              download
              className="flex items-center gap-1 text-sm text-racing hover:text-racing-light shrink-0"
            >
              <Download className="w-4 h-4" /> Baixar
            </a>
          )}
        </div>
      )}

      {proximoFuturo && (
        <div className="flex items-center gap-4 bg-racing/10 border border-racing/40 rounded-xl px-5 py-4">
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
          {/* Confirmação de presença chega na próxima etapa (seção de eventos futuros) */}
          <span className="text-xs text-asfalto-600 border border-asfalto-600 rounded-full px-2.5 py-1 shrink-0">
            Confirmação em breve
          </span>
        </div>
      )}
    </div>
  );
}
