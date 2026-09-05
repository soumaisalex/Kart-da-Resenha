import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import Landing from './pages/Landing.jsx';
import Home from './pages/Home.jsx';
import PerfilPiloto from './pages/PerfilPiloto.jsx';
import PerfilResultadoNaoVinculado from './pages/PerfilResultadoNaoVinculado.jsx';
import ReivindicarPerfil from './pages/ReivindicarPerfil.jsx';
import EventoDetalhe from './pages/EventoDetalhe.jsx';
import Admin from './pages/Admin.jsx';
import Painel from './pages/Painel.jsx';
import BotaoAdminFlutuante from './components/BotaoAdminFlutuante.jsx';
import ProtegerAdmin from './components/admin/ProtegerAdmin.jsx';
import ProtegerConta from './components/ProtegerConta.jsx';
import { CampeonatoProvider } from './context/CampeonatoContext.jsx';

// Layout das páginas públicas do campeonato — inclui o botão flutuante de acesso ao admin.
function LayoutPublico({ children }) {
  return (
    <CampeonatoProvider>
      {children}
      <BotaoAdminFlutuante />
    </CampeonatoProvider>
  );
}

// Layout da área administrativa — sem o botão flutuante (não faz sentido dentro do próprio admin).
function LayoutAdmin({ children }) {
  return (
    <CampeonatoProvider>
      <ProtegerAdmin>{children}</ProtegerAdmin>
    </CampeonatoProvider>
  );
}

// Raiz "/": quem já está logado vai direto pro painel — a landing page é só pra visitante.
function Inicio() {
  const [status, setStatus] = useState('verificando'); // verificando | visitante | logado

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => setStatus(r.ok ? 'logado' : 'visitante'))
      .catch(() => setStatus('visitante'));
  }, []);

  if (status === 'verificando') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-racing" />
      </div>
    );
  }

  if (status === 'logado') {
    return <Navigate to="/painel" replace />;
  }

  return <Landing />;
}

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Inicio />} />
        <Route path="/painel" element={<ProtegerConta><Painel /></ProtegerConta>} />

        <Route path="/c/:slug" element={<LayoutPublico><Home /></LayoutPublico>} />
        <Route path="/c/:slug/piloto/:id" element={<LayoutPublico><PerfilPiloto /></LayoutPublico>} />
        <Route path="/c/:slug/piloto/nome/:nome" element={<LayoutPublico><PerfilResultadoNaoVinculado /></LayoutPublico>} />
        <Route path="/c/:slug/reivindicar" element={<LayoutPublico><ReivindicarPerfil /></LayoutPublico>} />
        <Route path="/c/:slug/eventos/:id" element={<LayoutPublico><EventoDetalhe /></LayoutPublico>} />
        <Route path="/c/:slug/admin/*" element={<LayoutAdmin><Admin /></LayoutAdmin>} />
      </Routes>
    </div>
  );
}
