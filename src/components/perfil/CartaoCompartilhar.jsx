import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Share2, Loader2, User } from 'lucide-react';
import { msParaTempo } from '../../lib/tempo.js';

export default function CartaoCompartilhar({ piloto, onFechar }) {
  const cartaoRef = useRef(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [fotoFalhou, setFotoFalhou] = useState(false);

  // Foto servida pela mesma origem do site (via proxy) — captura de canvas trava com
  // imagens de outra origem (o bucket R2) sem cabeçalho de CORS configurado.
  const fotoProxy = piloto.foto_url ? `/api/imagem-proxy?url=${encodeURIComponent(piloto.foto_url)}` : null;
  const mostrarFoto = fotoProxy && !fotoFalhou;

  async function compartilhar() {
    setErro(null);
    setGerando(true);
    try {
      // Espera as fontes carregarem de verdade antes de capturar — se a captura rolar
      // antes disso, o navegador pode medir o layout com uma fonte e desenhar com outra,
      // desalinhando o texto na imagem final (mesmo que a tela ao vivo esteja certa).
      if (document.fonts?.ready) await document.fonts.ready;

      const dataUrl = await toPng(cartaoRef.current, { pixelRatio: 2, cacheBust: true });
      const blob = await (await fetch(dataUrl)).blob();
      const arquivo = new File([blob], `${piloto.nome.replace(/\s+/g, '-')}-kart-da-resenha.png`, {
        type: 'image/png'
      });

      if (navigator.canShare && navigator.canShare({ files: [arquivo] })) {
        await navigator.share({
          files: [arquivo],
          title: 'Kart da Resenha',
          text: `Confira meu perfil no Kart da Resenha!`
        });
      } else {
        // Desktop / navegadores sem suporte a compartilhar arquivo -> baixa a imagem
        const link = document.createElement('a');
        link.href = dataUrl;
        link.download = arquivo.name;
        link.click();
      }
    } catch (e) {
      if (e.name !== 'AbortError') {
        setErro(`Não foi possível gerar a imagem: ${e.message || 'erro desconhecido'}`);
      }
    } finally {
      setGerando(false);
    }
  }

  const posicaoGeral = piloto.ranking_geral?.posicao;
  const melhorVolta = piloto.stats?.melhor_volta_ms ? msParaTempo(piloto.stats.melhor_volta_ms) : '--:--.---';

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center px-4 gap-6">
      <button onClick={onFechar} className="absolute top-6 right-6 text-checkered hover:text-racing">
        <X className="w-6 h-6" />
      </button>

      {/*
        Card capturado pixel a pixel pela função de compartilhar.
        Layout de propósito SEM flexbox pra empilhar o conteúdo (flex-grow dentro de
        container com aspect-ratio não renderiza de forma confiável na captura via
        html-to-image). Fundo vermelho sólido — diferencia do resto do site, que é
        todo escuro — com uma faixa "ticker" (estética puxada da landing page) exibindo
        a melhor volta, e os cards de estatística em blocos escuros por cima do vermelho.
      */}
      <div
        ref={cartaoRef}
        className="w-72 h-[512px] rounded-2xl overflow-hidden relative bg-racing"
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#0a0b0d_0_10px,#f5f5f0_10px_20px)]" />

        <div className="flex items-center justify-center gap-2 px-6 pt-7">
          <img src="/logo-icone.png" alt="" className="h-6 w-auto" />
          <span className="font-display font-bold text-asfalto-950 text-sm tracking-wide">KART DA RESENHA</span>
        </div>

        <div className="px-6 mt-8 text-center">
          {mostrarFoto ? (
            <img
              src={fotoProxy}
              alt={piloto.nome}
              onError={() => setFotoFalhou(true)}
              className="w-24 h-24 rounded-full object-cover border-4 border-checkered mx-auto shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-asfalto-950/20 border-4 border-checkered flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-checkered" />
            </div>
          )}
          <p className="font-display font-bold text-2xl text-checkered leading-tight mt-4">{piloto.nome}</p>
          {posicaoGeral && (
            <p className="inline-block bg-asfalto-950 text-checkered font-display font-semibold text-xs px-3 py-1 rounded-full mt-2">
              {posicaoGeral}º no ranking geral
            </p>
          )}
        </div>

        {/* Faixa "ticker" — mesma estética da landing page, aqui parada (é uma imagem estática) */}
        <div className="mt-6 bg-asfalto-950 py-2.5 overflow-hidden -rotate-1">
          <p className="text-center font-display font-bold text-checkered text-sm tracking-wide">
            MELHOR VOLTA <span className="text-racing">•</span> {melhorVolta}
          </p>
        </div>

        <div className="absolute bottom-6 left-6 right-6 grid grid-cols-2 gap-3 text-center">
          <Estatistica valor={piloto.stats?.total_corridas ?? 0} label="corridas" />
          <Estatistica valor={Number(piloto.stats?.pontos_totais ?? 0)} label="pontos" />
        </div>
      </div>

      <button
        onClick={compartilhar}
        disabled={gerando}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-racing hover:bg-racing-dark
                   text-checkered font-display font-semibold disabled:opacity-60"
      >
        {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
        Compartilhar
      </button>

      {erro && <p className="text-racing-light text-sm">{erro}</p>}
    </div>
  );
}

function Estatistica({ valor, label }) {
  return (
    <div className="bg-asfalto-950 rounded-lg py-3">
      <p className="font-display font-bold text-checkered text-xl">{valor}</p>
      <p className="text-[10px] uppercase tracking-wide text-checkered/60">{label}</p>
    </div>
  );
}
