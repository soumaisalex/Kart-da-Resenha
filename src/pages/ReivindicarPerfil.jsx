import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Flag, Loader2, CheckCircle2 } from 'lucide-react';

export default function ReivindicarPerfil() {
  const [form, setForm] = useState({ nome: '', telefone: '', email: '', instagram: '', foto_url: '' });
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);
  const [concluido, setConcluido] = useState(false);

  function atualizar(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }));
  }

  async function enviar(e) {
    e.preventDefault();
    setErro(null);

    if (!form.nome.trim()) {
      setErro('O nome é obrigatório.');
      return;
    }

    setEnviando(true);
    try {
      const resp = await fetch('/api/pilotos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível reivindicar o perfil');
      setConcluido(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  if (concluido) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center space-y-4">
        <CheckCircle2 className="w-12 h-12 text-racing mx-auto" />
        <h1 className="font-display font-semibold text-xl text-checkered">Perfil enviado!</h1>
        <p className="text-asfalto-600">
          Seu perfil foi enviado pra aprovação. Assim que for aprovado, seus resultados já cadastrados
          (se houver corridas no seu nome) aparecem automaticamente.
        </p>
        <Link to="/" className="inline-block text-racing hover:text-racing-light text-sm font-medium">
          Voltar pra Home
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-md mx-auto px-4 py-10">
      <div className="flex items-center gap-2 justify-center mb-6">
        <Flag className="w-5 h-5 text-racing" />
        <h1 className="font-display font-bold text-xl text-checkered">Reivindicar perfil</h1>
      </div>

      <form onSubmit={enviar} className="space-y-4">
        <Campo label="Nome *" valor={form.nome} onChange={(v) => atualizar('nome', v)} obrigatorio />
        <Campo label="Telefone" valor={form.telefone} onChange={(v) => atualizar('telefone', v)} placeholder="(79) 9XXXX-XXXX" />
        <Campo label="E-mail" valor={form.email} onChange={(v) => atualizar('email', v)} tipo="email" />
        <Campo label="Instagram" valor={form.instagram} onChange={(v) => atualizar('instagram', v)} placeholder="@usuario" />
        <Campo label="URL da foto" valor={form.foto_url} onChange={(v) => atualizar('foto_url', v)} placeholder="https://..." />

        {erro && <p className="text-racing-light text-sm">{erro}</p>}

        <button
          type="submit"
          disabled={enviando}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-racing
                     hover:bg-racing-dark text-checkered font-display font-semibold disabled:opacity-60"
        >
          {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
          Enviar pra aprovação
        </button>

        <p className="text-xs text-asfalto-600 text-center">
          Um administrador vai revisar e aprovar seu perfil antes que ele apareça no site.
        </p>
      </form>
    </main>
  );
}

function Campo({ label, valor, onChange, tipo = 'text', placeholder, obrigatorio }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-asfalto-600">{label}</span>
      <input
        type={tipo}
        value={valor}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        required={obrigatorio}
        className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
      />
    </label>
  );
}
