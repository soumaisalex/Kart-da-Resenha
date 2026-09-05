import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';

// GOOGLE_CLIENT_ID é inserido no bundle em tempo de build pelo Vite — precisa estar
// configurado como VITE_GOOGLE_CLIENT_ID nas variáveis de ambiente do Cloudflare Pages.
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function BotaoGoogle({ onEntrar, tema = 'filled_black' }) {
  const botaoRef = useRef(null);
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) {
      setErro('VITE_GOOGLE_CLIENT_ID não configurado.');
      setCarregando(false);
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
          theme: tema,
          size: 'large',
          shape: 'pill',
          text: 'continue_with',
          width: 280
        });
        setCarregando(false);
      } else if (tentativas > 40) {
        clearInterval(intervalo);
        setErro('Não foi possível carregar o login do Google. Recarregue a página.');
        setCarregando(false);
      }
    }, 100);

    return () => clearInterval(intervalo);
  }, [onEntrar, tema]);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex justify-center min-h-[44px] items-center">
        {carregando && <Loader2 className="w-5 h-5 animate-spin text-racing" />}
        <div ref={botaoRef} />
      </div>
      {erro && (
        <p className="flex items-center gap-2 justify-center text-racing-light text-sm max-w-xs text-center">
          <AlertTriangle className="w-4 h-4 shrink-0" /> {erro}
        </p>
      )}
    </div>
  );
}
