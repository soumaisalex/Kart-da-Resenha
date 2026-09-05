import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Plus, Loader2, ExternalLink, Settings, LogOut, Trophy } from 'lucide-react';

export default function Painel() {
  const [campeonatos, setCampeonatos] = useState(null);
  const [criando, setCriando] = useState(false);
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState(null);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    try {
      const resp = await fetch('/api/painel/campeonatos');
      setCampeonatos(resp.ok ? await resp.json() : []);
    } catch {
      setCampeonatos([]);
    }
  }

  async function criar(e) {
    e.preventDefault();
    setErro(null);
    if (!nome.trim()) {
      setErro('Digite um nome.');
      return;
    }
    setEnviando(true);
    try {
      const resp = await fetch('/api/painel/campeonatos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome })
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível criar o campeonato');
      setNome('');
      setCriando(false);
      carregar();
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  async function sair() {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/painel';
  }

  if (campeonatos === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-racing" />
      </div>
    );
  }

  return (
    <main className="max-w-2xl mx-auto px-4 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flag className="w-6 h-6 text-racing" />
          <h1 className="font-display font-bold text-2xl text-checkered">Meus campeonatos</h1>
        </div>
        <button onClick={sair} className="flex items-center gap-1.5 text-sm text-asfalto-600 hover:text-checkered">
          <LogOut className="w-4 h-4" /> Sair
        </button>
      </div>

      {campeonatos.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-10 text-asfalto-600 text-center">
          <Trophy className="w-8 h-8" />
          <p>Você ainda não tem nenhum campeonato — crie o primeiro abaixo.</p>
        </div>
      )}

      <div className="space-y-2">
        {campeonatos.map((c) => (
          <div key={c.id} className="flex flex-wrap items-center gap-3 px-4 py-3 border border-asfalto-700 rounded-lg">
            <div className="flex-1 min-w-0">
              <p className="font-medium text-checkered truncate">{c.nome}</p>
              <p className="text-xs text-asfalto-600">/c/{c.slug}</p>
            </div>
            <Link
              to={`/c/${c.slug}`}
              className="flex items-center gap-1 text-sm text-asfalto-600 hover:text-checkered"
            >
              <ExternalLink className="w-3.5 h-3.5" /> Ver site
            </Link>
            <Link
              to={`/c/${c.slug}/admin`}
              className="flex items-center gap-1 text-sm bg-racing hover:bg-racing-dark text-checkered px-3 py-1.5 rounded-lg font-medium"
            >
              <Settings className="w-3.5 h-3.5" /> Administrar
            </Link>
          </div>
        ))}
      </div>

      {!criando ? (
        <button
          onClick={() => setCriando(true)}
          className="flex items-center gap-2 text-sm text-racing hover:text-racing-light"
        >
          <Plus className="w-4 h-4" /> Criar novo campeonato
        </button>
      ) : (
        <form onSubmit={criar} className="space-y-3 border border-asfalto-700 rounded-lg p-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="text-asfalto-600">Nome do campeonato</span>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              autoFocus
              placeholder="Ex: Kart do Grupo dos Sextas"
              className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
            />
          </label>
          <p className="text-xs text-asfalto-600">
            O endereço do site é gerado automaticamente a partir do nome (ex: /c/kart-do-grupo-dos-sextas).
          </p>

          {erro && <p className="text-racing-light text-sm">{erro}</p>}

          <div className="flex gap-2">
            <button
              type="submit"
              disabled={enviando}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-racing hover:bg-racing-dark
                         text-checkered text-sm font-medium disabled:opacity-60"
            >
              {enviando && <Loader2 className="w-4 h-4 animate-spin" />} Criar
            </button>
            <button
              type="button"
              onClick={() => { setCriando(false); setErro(null); }}
              className="px-4 py-2 rounded-lg border border-asfalto-600 text-checkered text-sm"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
    </main>
  );
}
