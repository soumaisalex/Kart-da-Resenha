import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PerfilPiloto from './pages/PerfilPiloto.jsx';
import PerfilResultadoNaoVinculado from './pages/PerfilResultadoNaoVinculado.jsx';
import ReivindicarPerfil from './pages/ReivindicarPerfil.jsx';
import EventoDetalhe from './pages/EventoDetalhe.jsx';
import Admin from './pages/Admin.jsx';
import BotaoAdminFlutuante from './components/BotaoAdminFlutuante.jsx';
import ProtegerAdmin from './components/admin/ProtegerAdmin.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/piloto/:id" element={<PerfilPiloto />} />
        <Route path="/piloto/nome/:nome" element={<PerfilResultadoNaoVinculado />} />
        <Route path="/reivindicar" element={<ReivindicarPerfil />} />
        <Route path="/eventos/:id" element={<EventoDetalhe />} />
        <Route
          path="/admin/*"
          element={
            <ProtegerAdmin>
              <Admin />
            </ProtegerAdmin>
          }
        />
      </Routes>

      {/* Botão flutuante — acesso à área administrativa, some quando já está em /admin */}
      <BotaoAdminFlutuante />
    </div>
  );
}
