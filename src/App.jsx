import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import PerfilPiloto from './pages/PerfilPiloto.jsx';
import Admin from './pages/Admin.jsx';
import BotaoAdminFlutuante from './components/BotaoAdminFlutuante.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/piloto/:id" element={<PerfilPiloto />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>

      {/* Botão flutuante — acesso à área administrativa, some quando já está em /admin */}
      <BotaoAdminFlutuante />
    </div>
  );
}
