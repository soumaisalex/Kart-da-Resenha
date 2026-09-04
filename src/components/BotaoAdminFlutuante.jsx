import { useLocation, useNavigate } from 'react-router-dom';
import { Wrench } from 'lucide-react';
import { useCampeonato } from '../context/CampeonatoContext.jsx';

export default function BotaoAdminFlutuante() {
  const location = useLocation();
  const navigate = useNavigate();
  const { rota } = useCampeonato();

  if (location.pathname.includes('/admin')) return null;

  return (
    <button
      onClick={() => navigate(rota('/admin'))}
      aria-label="Área administrativa"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center
                 w-14 h-14 rounded-full bg-racing hover:bg-racing-dark
                 shadow-lg shadow-black/40 transition-colors"
    >
      <Wrench className="w-6 h-6 text-checkered" />
    </button>
  );
}
