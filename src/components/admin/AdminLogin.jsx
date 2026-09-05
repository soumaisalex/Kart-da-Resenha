import { Flag } from 'lucide-react';
import BotaoGoogle from '../BotaoGoogle.jsx';

export default function AdminLogin({ onEntrar }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-asfalto-900 border border-asfalto-700 rounded-xl p-8 space-y-5 text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Flag className="w-6 h-6 text-racing" />
          <h1 className="font-display font-bold text-xl text-checkered">Área Administrativa</h1>
        </div>

        <p className="text-sm text-asfalto-600">Entre com sua conta Google pra continuar.</p>

        <BotaoGoogle onEntrar={onEntrar} />
      </div>
    </div>
  );
}
