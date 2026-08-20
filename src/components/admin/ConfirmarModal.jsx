import { AlertTriangle, Loader2 } from 'lucide-react';

// Modal genérico de confirmação — usar no lugar de window.confirm() em qualquer
// ação destrutiva ou irreversível (excluir, rejeitar, etc.).
export default function ConfirmarModal({
  titulo,
  mensagem,
  textoConfirmar = 'Confirmar',
  textoCancelar = 'Cancelar',
  confirmando = false,
  perigo = true,
  onConfirmar,
  onCancelar
}) {
  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-asfalto-900 border border-asfalto-700 rounded-xl p-6">
        <div className="flex items-start gap-3 mb-4">
          <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${perigo ? 'bg-racing/15' : 'bg-asfalto-800'}`}>
            <AlertTriangle className={`w-5 h-5 ${perigo ? 'text-racing' : 'text-asfalto-600'}`} />
          </div>
          <div>
            <h2 className="font-display font-semibold text-checkered">{titulo}</h2>
            {mensagem && <p className="text-sm text-asfalto-600 mt-1">{mensagem}</p>}
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancelar}
            disabled={confirmando}
            className="px-4 py-2 rounded-lg border border-asfalto-600 text-checkered text-sm hover:bg-asfalto-800 disabled:opacity-60"
          >
            {textoCancelar}
          </button>
          <button
            onClick={onConfirmar}
            disabled={confirmando}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-checkered disabled:opacity-60 ${
              perigo ? 'bg-racing hover:bg-racing-dark' : 'bg-asfalto-700 hover:bg-asfalto-600'
            }`}
          >
            {confirmando && <Loader2 className="w-4 h-4 animate-spin" />}
            {textoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
