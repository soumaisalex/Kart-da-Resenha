import { useEffect, useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { X, Download, Loader2, User } from 'lucide-react';
import { msParaTempo } from '../../lib/tempo.js';

export default function CartaoCompartilhar({ piloto, onFechar }) {
  const cartaoRef = useRef(null);
  const [gerando, setGerando] = useState(false);
  const [erro, setErro] = useState(null);
  const [fotoDataUrl, setFotoDataUrl] = useState(null);
  const [fotoCarregando, setFotoCarregando] = useState(!!piloto.foto_url);
  const [erroFoto, setErroFoto] = useState(null);

  // Converte a foto pra data URL assim que o modal abre — em vez de deixar o
  // <img> apontar pro proxy e torcer pra já estar carregado na hora da captura
  // (o html-to-image roda no exato momento do clique, e uma requisição de rede
  // que ainda não terminou vira uma foto em branco na imagem final). Um data URL
  // já fica embutido no HTML, sem depender de rede nenhuma na hora de gerar.
  useEffect(() => {
    if (!piloto.foto_url) {
      setFotoCarregando(false);
      return;
    }
    let cancelado = false;
    fetch(`/api/imagem-proxy?url=${encodeURIComponent(piloto.foto_url)}`)
      .then((resp) => {
        if (!resp.ok) throw new Error(`Proxy respondeu ${resp.status}`);
        return resp.blob();
      })
      .then(
        (blob) =>
          new Promise((resolve, reject) => {
            if (!blob.type.startsWith('image/')) {
              reject(new Error(`Resposta não é uma imagem (tipo: ${blob.type || 'desconhecido'}, tamanho: ${blob.size}b)`));
              return;
            }
            const leitor = new FileReader();
            leitor.onload = () => resolve(leitor.result);
            leitor.onerror = () => reject(new Error('Falha ao ler o arquivo da foto'));
            leitor.readAsDataURL(blob);
          })
      )
      .then((dataUrl) => {
        // Ter o data URL pronto não garante que o navegador já decodificou/pintou
        // a imagem — isso é feito de forma assíncrona internamente. Criar uma nova
        // Image() e esperar o onload garante que ela já está pronta pra aparecer
        // em qualquer captura seguinte, eliminando a intermitência.
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve(dataUrl);
          img.onerror = () => reject(new Error('Falha ao decodificar a imagem'));
          img.src = dataUrl;
        });
      })
      .then((dataUrl) => {
        if (!cancelado) setFotoDataUrl(dataUrl);
      })
      .catch((e) => {
        if (!cancelado) {
          setFotoDataUrl(null);
          setErroFoto(e.message || 'Erro desconhecido ao carregar a foto');
        }
      })
      .finally(() => {
        if (!cancelado) setFotoCarregando(false);
      });
    return () => {
      cancelado = true;
    };
  }, [piloto.foto_url]);

  async function baixarImagem() {
    setErro(null);
    setGerando(true);
    try {
      // Espera as fontes carregarem de verdade antes de capturar — se a captura rolar
      // antes disso, o navegador pode medir o layout com uma fonte e desenhar com outra,
      // desalinhando o texto na imagem final (mesmo que a tela ao vivo esteja certa).
      if (document.fonts?.ready) await document.fonts.ready;

      // Espera dois frames de animação — dá tempo do navegador terminar de pintar
      // qualquer atualização pendente (ex: a foto que acabou de entrar) antes da
      // captura em si. Sem isso, a captura pode rodar entre o React atualizar o
      // DOM e o navegador efetivamente desenhar aquilo na tela, gerando um card
      // "pela metade" só de vez em quando — exatamente o tipo de falha intermitente.
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

      const dataUrl = await toPng(cartaoRef.current, { pixelRatio: 2, cacheBust: true });

      // Sempre baixa o arquivo direto — em qualquer dispositivo, sem abrir central
      // de compartilhamento nenhuma (nem no celular, nem no computador).
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${piloto.nome.replace(/\s+/g, '-')}-kart-da-resenha.png`;
      link.click();
    } catch (e) {
      setErro(`Não foi possível gerar a imagem: ${e.message || 'erro desconhecido'}`);
    } finally {
      setGerando(false);
    }
  }

  const posicaoGeral = piloto.ranking_geral?.posicao;
  const melhorVolta = piloto.stats?.melhor_volta_ms ? msParaTempo(piloto.stats.melhor_volta_ms) : '--:--.---';
  const velMedia = piloto.stats?.vel_media_media ? `${Number(piloto.stats.vel_media_media).toFixed(1)}` : '--';

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
          {fotoCarregando ? (
            <div className="w-24 h-24 rounded-full bg-asfalto-950/20 border-4 border-checkered flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-checkered animate-spin" />
            </div>
          ) : fotoDataUrl ? (
            <img
              src={fotoDataUrl}
              alt={piloto.nome}
              className="w-24 h-24 rounded-full object-cover border-4 border-checkered mx-auto shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-asfalto-950/20 border-4 border-checkered flex items-center justify-center mx-auto">
              <User className="w-10 h-10 text-checkered" />
            </div>
          )}
          <p className="font-display font-bold text-2xl text-checkered leading-tight mt-4">{piloto.nome}</p>
          {piloto.instagram && (
            <p className="text-checkered/70 text-xs mt-1">
              {piloto.instagram.startsWith('@') ? piloto.instagram : `@${piloto.instagram}`}
            </p>
          )}
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

        <div className="px-6 mt-6 grid grid-cols-3 gap-2 text-center">
          <Estatistica valor={piloto.stats?.total_corridas ?? 0} label="corridas" />
          <Estatistica valor={velMedia} label="km/h méd." />
          <Estatistica valor={Number(piloto.stats?.pontos_totais ?? 0)} label="pontos" />
        </div>
      </div>

      <button
        onClick={baixarImagem}
        disabled={gerando || fotoCarregando}
        className="flex items-center gap-2 px-6 py-3 rounded-full bg-racing hover:bg-racing-dark
                   text-checkered font-display font-semibold disabled:opacity-60"
      >
        {gerando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
        Baixar imagem
      </button>

      {erro && <p className="text-racing-light text-sm">{erro}</p>}
      {erroFoto && (
        <div className="text-racing-light text-xs max-w-xs text-center space-y-1">
          <p>Foto não carregou: {erroFoto}</p>
          <p className="text-asfalto-600 break-all">URL: {piloto.foto_url}</p>
        </div>
      )}
    </div>
  );
}

function Estatistica({ valor, label }) {
  return (
    <div className="bg-asfalto-950 rounded-lg py-5 px-1">
      <p className="font-display font-bold text-checkered text-lg">{valor}</p>
      <p className="text-[9px] uppercase tracking-wide text-checkered/60 mt-0.5">{label}</p>
    </div>
  );
}
