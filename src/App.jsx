import { Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PerfilPiloto from './pages/PerfilPiloto.jsx';
import PerfilResultadoNaoVinculado from './pages/PerfilResultadoNaoVinculado.jsx';
import ReivindicarPerfil from './pages/ReivindicarPerfil.jsx';
import EventoDetalhe from './pages/EventoDetalhe.jsx';
import Admin from './pages/Admin.jsx';
import BotaoAdminFlutuante from './components/BotaoAdminFlutuante.jsx';
import ProtegerAdmin from './components/admin/ProtegerAdmin.jsx';
import { CampeonatoProvider } from './context/CampeonatoContext.jsx';

// TODO (próxima fase): a raiz "/" vai virar a landing page one-page (marketing +
// login/cadastro). Por enquanto redireciona pro único campeonato que existe.
const SLUG_LEGADO = 'kart-da-resenha';

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

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to={`/c/${SLUG_LEGADO}`} replace />} />

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
