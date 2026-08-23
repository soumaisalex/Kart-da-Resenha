import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Share2, Loader2, Trophy, User } from 'lucide-react';
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

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex flex-col items-center justify-center px-4 gap-6">
      <button onClick={onFechar} className="absolute top-6 right-6 text-checkered hover:text-racing">
        <X className="w-6 h-6" />
      </button>

      {/*
        Card capturado pixel a pixel pela função de compartilhar.
        Layout de propósito SEM flexbox pra empilhar o conteúdo (flex-grow dentro de
        container com aspect-ratio não renderiza de forma confiável na captura via
        html-to-image — é uma limitação conhecida da lib). Altura fixa em pixels +
        margem simples entre blocos + estatísticas fixadas no rodapé por posição
        absoluta, desacopladas da altura do nome (que pode quebrar em 2 linhas).
      */}
      <div
        ref={cartaoRef}
        className="w-72 h-[512px] rounded-2xl overflow-hidden relative
                   bg-gradient-to-b from-asfalto-900 to-asfalto-950 border border-asfalto-700"
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#ff3b30_0_10px,#f5f5f0_10px_20px)]" />

        <div className="flex items-center gap-2 px-6 pt-6">
          <Trophy className="w-4 h-4 text-racing" />
          <span className="font-display font-semibold text-checkered text-sm tracking-wide">KART DA RESENHA</span>
        </div>

        <div className="px-6 mt-16 text-center">
          {mostrarFoto ? (
            <img
              src={fotoProxy}
              alt={piloto.nome}
              onError={() => setFotoFalhou(true)}
              className="w-24 h-24 rounded-full object-cover border-4 border-racing mx-auto"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-asfalto-800 border-4 border-racing flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-asfalto-600" />
            </div>
          )}
          <p className="font-display font-bold text-2xl text-checkered leading-tight mt-4">{piloto.nome}</p>
          {posicaoGeral && (
            <p className="text-racing font-display font-semibold text-sm mt-2">{posicaoGeral}º no ranking geral</p>
          )}
        </div>

        <div className="absolute bottom-6 left-6 right-6 grid grid-cols-3 gap-2 text-center">
          <Estatistica valor={piloto.stats?.total_corridas ?? 0} label="corridas" />
          <Estatistica valor={Number(piloto.stats?.pontos_totais ?? 0)} label="pontos" />
          <Estatistica
            valor={piloto.stats?.melhor_volta_ms ? msParaTempo(piloto.stats.melhor_volta_ms) : '--'}
            label="melhor volta"
            pequeno
          />
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

function Estatistica({ valor, label, pequeno }) {
  return (
    <div className="bg-asfalto-800/60 rounded-lg py-2">
      <p className={`font-display font-bold text-checkered ${pequeno ? 'text-sm' : 'text-lg'}`}>{valor}</p>
      <p className="text-[10px] uppercase tracking-wide text-asfalto-600">{label}</p>
    </div>
  );
}
