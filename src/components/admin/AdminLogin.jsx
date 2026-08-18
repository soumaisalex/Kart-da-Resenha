import { useState } from 'react';
import { Flag, Loader2 } from 'lucide-react';

export default function AdminLogin({ onEntrar }) {
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(e) {
    e.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const resp = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, senha })
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível entrar');
      onEntrar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <form
        onSubmit={entrar}
        className="w-full max-w-sm bg-asfalto-900 border border-asfalto-700 rounded-xl p-8 space-y-5"
      >
        <div className="flex items-center gap-2 justify-center mb-2">
          <Flag className="w-6 h-6 text-racing" />
          <h1 className="font-display font-bold text-xl text-checkered">Área Administrativa</h1>
        </div>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-asfalto-600">Usuário</span>
          <input
            value={usuario}
            onChange={(e) => setUsuario(e.target.value)}
            className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
            required
            autoFocus
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="text-asfalto-600">Senha</span>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
            required
          />
        </label>

        {erro && <p className="text-racing-light text-sm">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-racing
                     hover:bg-racing-dark text-checkered font-display font-semibold disabled:opacity-60"
        >
          {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
          Entrar
        </button>
      </form>
    </div>
  );
}
