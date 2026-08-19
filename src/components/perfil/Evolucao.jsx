const COR_POSICAO = { 1: 'bg-ouro text-asfalto-950', 2: 'bg-prata text-asfalto-950', 3: 'bg-bronze text-asfalto-950' };

function formatarDataCurta(data) {
  return new Date(`${data}T00:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function Evolucao({ historico }) {
  if (!historico?.length) return null;

  return (
    <div className="flex gap-3 overflow-x-auto pb-2">
      {historico.map((h) => (
        <div key={h.evento_id} className="flex flex-col items-center gap-1 shrink-0">
          <div
            className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-sm
                        ${COR_POSICAO[h.posicao] || 'bg-asfalto-800 text-checkered'}`}
          >
            {h.posicao}º
          </div>
          <span className="text-[11px] text-asfalto-600">{formatarDataCurta(h.data_evento)}</span>
        </div>
      ))}
    </div>
  );
}
