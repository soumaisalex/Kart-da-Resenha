import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Share2, Loader2, Trophy, Zap, User } from 'lucide-react';
import { msParaTempo } from '../../lib/tempo.js';

export default function CartaoCompartilhar({ piloto, onFechar }) {
  const cartaoRef = useRef(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);

  // Foto servida pela mesma origem do site (via proxy) — captura de canvas trava com
  // imagens de outra origem (o bucket R2) sem cabeçalho de CORS configurado.
  const fotoProxy = piloto.foto_url ? `/api/imagem-proxy?url=${encodeURIComponent(piloto.foto_url)}` : null;

  async function compartilhar() {
    setErro(null);
    setGerando(true);
    try {
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

      {/* Card capturado pixel a pixel pela função de compartilhar */}
      <div
        ref={cartaoRef}
        className="w-72 aspect-[9/16] rounded-2xl overflow-hidden relative flex flex-col justify-between
                   bg-gradient-to-b from-asfalto-900 to-asfalto-950 p-6 border border-asfalto-700"
      >
        <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#ff3b30_0_10px,#f5f5f0_10px_20px)]" />

        <div className="flex items-center gap-2 mt-2">
          <Trophy className="w-4 h-4 text-racing" />
          <span className="font-display font-semibold text-checkered text-sm tracking-wide">KART DA RESENHA</span>
        </div>

        <div className="flex flex-col items-center gap-3 -mt-6">
          {fotoProxy ? (
            <img
              src={fotoProxy}
              alt={piloto.nome}
              crossOrigin="anonymous"
              className="w-24 h-24 rounded-full object-cover border-4 border-racing"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-asfalto-800 border-4 border-racing flex items-center justify-center">
              <User className="w-10 h-10 text-asfalto-600" />
            </div>
          )}
          <p className="font-display font-bold text-2xl text-checkered text-center leading-tight">{piloto.nome}</p>
          {posicaoGeral && (
            <p className="text-racing font-display font-semibold text-sm">{posicaoGeral}º no ranking geral</p>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2 text-center">
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
