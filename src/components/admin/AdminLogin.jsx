import { useEffect, useRef, useState } from 'react';
import { Flag, Loader2, AlertTriangle } from 'lucide-react';

// GOOGLE_CLIENT_ID é inserido no bundle em tempo de build pelo Vite — precisa estar
// configurado como VITE_GOOGLE_CLIENT_ID nas variáveis de ambiente do Cloudflare Pages.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function AdminLogin({ onEntrar }) {
  const botaoRef = useRef(null);
  const [erro, setErro] = useState(null);
  const [carregandoGoogle, setCarregandoGoogle] = useState(true);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setErro('VITE_GOOGLE_CLIENT_ID não configurado.');
      setCarregandoGoogle(false);
      return;
    }

    async function processarCredencial(resposta) {
      setErro(null);
      try {
        const resp = await fetch('/api/auth/google', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: resposta.credential })
        });
        const dados = await resp.json();
        if (!resp.ok) throw new Error(dados.erro || 'Não foi possível entrar com o Google');
        onEntrar();
      } catch (e) {
        setErro(e.message);
      }
    }

    // O script do Google (carregado no index.html) pode ainda não ter terminado de
    // carregar quando este componente monta — espera aparecer antes de inicializar.
    let tentativas = 0;
    const intervalo = setInterval(() => {
      tentativas++;
      if (window.google?.accounts?.id) {
        clearInterval(intervalo);
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: processarCredencial
        });
        window.google.accounts.id.renderButton(botaoRef.current, {
          theme: 'filled_black',
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 280
        });
        setCarregandoGoogle(false);
      } else if (tentativas > 40) {
        clearInterval(intervalo);
        setErro('Não foi possível carregar o login do Google. Recarregue a página.');
        setCarregandoGoogle(false);
      }
    }, 100);

    return () => clearInterval(intervalo);
  }, [onEntrar]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-asfalto-900 border border-asfalto-700 rounded-xl p-8 space-y-5 text-center">
        <div className="flex items-center gap-2 justify-center mb-2">
          <Flag className="w-6 h-6 text-racing" />
          <h1 className="font-display font-bold text-xl text-checkered">Área Administrativa</h1>
        </div>

        <p className="text-sm text-asfalto-600">Entre com sua conta Google pra continuar.</p>

        <div className="flex justify-center min-h-[44px] items-center">
          {carregandoGoogle && <Loader2 className="w-5 h-5 animate-spin text-racing" />}
          <div ref={botaoRef} />
        </div>

        {erro && (
          <p className="flex items-center gap-2 justify-center text-racing-light text-sm">
            <AlertTriangle className="w-4 h-4 shrink-0" /> {erro}
          </p>
        )}
      </div>
    </div>
  );
}
