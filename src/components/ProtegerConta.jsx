import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import AdminLogin from './admin/AdminLogin.jsx';

export default function ProtegerConta({ children }) {
  const [status, setStatus] = useState('verificando'); // verificando | autenticado | negado

  useEffect(() => {
    verificarSessao();
  }, []);

  async function verificarSessao() {
    try {
      const resp = await fetch('/api/auth/me');
      setStatus(resp.ok ? 'autenticado' : 'negado');
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

  return children;
}
