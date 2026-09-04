import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function EditarEventoModal({ evento, onFechar, onSalvo }) {
  const { apiUrl } = useCampeonato();
  const [form, setForm] = useState({
    nome: evento.nome || '',
    data_evento: evento.data_evento?.slice(0, 10) || '',
    local: evento.local || ''
  });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function salvar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);
    try {
      const resp = await fetch(apiUrl(`/eventos/${evento.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível salvar');
      onSalvo(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-asfalto-900 border border-asfalto-700 rounded-xl p-6 relative">
        <button onClick={onFechar} className="absolute top-4 right-4 text-asfalto-600 hover:text-checkered">
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-semibold text-lg text-checkered mb-4">Editar evento</h2>

        <form onSubmit={salvar} className="space-y-3">
          <Campo label="Nome" valor={form.nome} onChange={(v) => setForm({ ...form, nome: v })} />
          <Campo label="Data" tipo="date" valor={form.data_evento} onChange={(v) => setForm({ ...form, data_evento: v })} />
          <Campo label="Local" valor={form.local} onChange={(v) => setForm({ ...form, local: v })} />

          {erro && <p className="text-racing-light text-sm">{erro}</p>}

          <button
            type="submit"
            disabled={enviando}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-racing
                       hover:bg-racing-dark text-checkered font-display font-semibold disabled:opacity-60"
          >
            {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
            Salvar alterações
          </button>
        </form>
      </div>
    </div>
  );
}

function Campo({ label, valor, onChange, tipo = 'text' }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-asfalto-600">{label}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
      />
    </label>
  );
}
