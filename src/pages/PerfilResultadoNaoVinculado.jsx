import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, User, ArrowLeft, UserPlus } from 'lucide-react';
import EstatisticasPiloto from '../components/perfil/EstatisticasPiloto.jsx';

export default function PerfilResultadoNaoVinculado() {
  const { nome } = useParams();
  const [dados, setDados] = useState(null);
  const [erro, setErro] = useState(null);

  useEffect(() => {
    carregar();
  }, [nome]);

  async function carregar() {
    setErro(null);
    setDados(null);
    try {
      const resp = await fetch(`/api/pilotos/por-nome/${encodeURIComponent(nome)}`);
      const corpo = await resp.json();
      if (!resp.ok) throw new Error(corpo.erro || 'Não encontramos esse resultado');
      setDados(corpo);
    } catch (e) {
      setErro(e.message);
    }
  }

  if (erro) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-checkered">{erro}</p>
        <Link to="/" className="text-racing hover:text-racing-light text-sm mt-3 inline-block">
          Voltar pra Home
        </Link>
      </main>
    );
  }

  if (!dados) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-racing" />
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-8">
      <Link to="/" className="flex items-center gap-1.5 text-sm text-asfalto-600 hover:text-checkered w-fit">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      <div className="flex flex-col items-center text-center gap-3">
        <div className="w-24 h-24 rounded-full bg-asfalto-800 border-4 border-asfalto-600 flex items-center justify-center">
          <User className="w-10 h-10 text-asfalto-600" />
        </div>
        <h1 className="font-display font-bold text-2xl text-checkered">{dados.nome}</h1>
        <p className="text-sm text-asfalto-600">Esse piloto ainda não reivindicou o perfil.</p>
      </div>

      <EstatisticasPiloto dados={dados} />

      <Link
        to={`/reivindicar?nome=${encodeURIComponent(dados.nome)}`}
        className="flex items-center justify-center gap-2 w-full py-3 rounded-lg bg-racing hover:bg-racing-dark
                   text-checkered font-display font-semibold"
      >
        <UserPlus className="w-4 h-4" /> Esse sou eu — cadastrar perfil
      </Link>
    </main>
  );
}
