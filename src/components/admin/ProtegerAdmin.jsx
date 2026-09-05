import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, ShieldAlert } from 'lucide-react';
import AdminLogin from './AdminLogin.jsx';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function ProtegerAdmin({ children }) {
  const { apiUrl, rota } = useCampeonato();
  // verificando | negado | sem-permissao | autenticado
  const [status, setStatus] = useState('verificando');

  useEffect(() => {
    verificarSessao();
  }, []);

  async function verificarSessao() {
    try {
      const respAuth = await fetch('/api/auth/me');
      if (!respAuth.ok) {
        setStatus('negado');
        return;
      }
      const respDono = await fetch(apiUrl('/eh-dono'));
      setStatus(respDono.ok ? 'autenticado' : 'sem-permissao');
    } catch {
      setStatus('negado');
    }
  }

  if (status === 'verificando') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-racing" />
      </div>
    );
  }

  if (status === 'negado') {
    return <AdminLogin onEntrar={verificarSessao} />;
  }

  if (status === 'sem-permissao') {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm text-center space-y-4">
          <ShieldAlert className="w-10 h-10 text-racing mx-auto" />
          <h1 className="font-display font-semibold text-lg text-checkered">
            Você está logado, mas essa conta não é dona deste campeonato
          </h1>
          <p className="text-sm text-asfalto-600">
            Se você acha que isso é um engano, confirme com quem administra este campeonato,
            ou vá pro seu próprio painel pra ver os campeonatos que você administra.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <Link to="/painel" className="px-4 py-2 rounded-lg bg-racing hover:bg-racing-dark text-checkered text-sm font-medium">
              Meu painel
            </Link>
            <Link to={rota('/')} className="px-4 py-2 rounded-lg border border-asfalto-600 text-checkered text-sm">
              Ver o site
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return children;
}
