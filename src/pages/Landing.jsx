import { Camera, ListChecks, UserCheck2, TrendingUp, CalendarCheck, Share2, Layers, Trophy } from 'lucide-react';
import PodioIlustrativo from '../components/landing/PodioIlustrativo.jsx';
import TickerFaixa from '../components/landing/TickerFaixa.jsx';
import BotaoGoogle from '../components/BotaoGoogle.jsx';

const PASSOS = [
  {
    icone: Camera,
    titulo: 'Fotografe a tabela de resultados',
    texto: 'Aquela folha impressa no fim da corrida, ou um print da tela do cronômetro — a leitura automática entende sozinha.'
  },
  {
    icone: ListChecks,
    titulo: 'Revise e confirme',
    texto: 'Você sempre vê o que foi lido antes de publicar, e corrige na hora se precisar.'
  },
  {
    icone: TrendingUp,
    titulo: 'O ranking se atualiza sozinho',
    texto: 'Pontuação por posição, bônus de volta mais rápida, tudo recalculado na hora.'
  },
  {
    icone: UserCheck2,
    titulo: 'Cada piloto acompanha o próprio desempenho',
    texto: 'Reivindicando o perfil, aparecem estatísticas, posição no ranking e a evolução ao longo das corridas.'
  }
];

const RECURSOS = [
  {
    icone: Trophy,
    cor: 'text-ouro',
    corBg: 'bg-ouro/10',
    titulo: 'Ranking sempre atualizado',
    texto: 'Geral, por temporada e por corrida — recalculado automaticamente a cada resultado importado.'
  },
  {
    icone: CalendarCheck,
    cor: 'text-racing',
    corBg: 'bg-racing/10',
    titulo: 'Confirmação de presença',
    texto: 'Marca a próxima corrida e os pilotos confirmam direto pelo site, sem grupo de WhatsApp lotado.'
  },
  {
    icone: Share2,
    cor: 'text-prata',
    corBg: 'bg-prata/10',
    titulo: 'Card pra compartilhar',
    texto: 'Cada piloto gera uma imagem com o próprio desempenho, no formato certo pra postar no story.'
  },
  {
    icone: Layers,
    cor: 'text-bronze',
    corBg: 'bg-bronze/10',
    titulo: 'Seu campeonato, isolado',
    texto: 'Pilotos, resultados e pontuação não se misturam com nenhum outro campeonato da plataforma.'
  }
];

export default function Landing() {
  function irParaPainel() {
    window.location.href = '/painel';
  }

  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* Herói */}
      <header className="relative overflow-hidden">
        {/* Glow diagonal atrás do conteúdo — dá profundidade sem ser um degradê genérico */}
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[140%] h-[520px] opacity-60 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at center, rgba(255,59,48,0.18) 0%, rgba(255,59,48,0) 65%)' }}
        />
        <div className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#ff3b30_0_16px,#f5f5f0_16px_32px)]" />

        <div className="relative max-w-5xl mx-auto px-4 pt-14 pb-16 sm:pt-20 sm:pb-20">
          <img
            src="/logo-completa.png"
            alt="Kart da Resenha"
            className="w-40 sm:w-52 mx-auto mb-10 drop-shadow-[0_0_30px_rgba(255,59,48,0.25)]"
          />

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-checkered text-center max-w-2xl mx-auto leading-tight">
            O ranking da sua resenha de kart, <span className="text-racing">sem planilha</span>
          </h1>
          <p className="text-asfalto-600 text-center max-w-md mx-auto mt-4 sm:text-lg">
            Tira uma foto da tabela de resultados. A leitura automática cuida do resto: pontuação,
            ranking e histórico de cada piloto, sempre em dia.
          </p>

          <div className="mt-8 flex justify-center">
            <div className="rounded-full animate-pulso-glow">
              <BotaoGoogle onEntrar={irParaPainel} />
            </div>
          </div>

          <div className="mt-14 sm:mt-16">
            <PodioIlustrativo />
          </div>
        </div>
      </header>

      <TickerFaixa />

      {/* Como funciona */}
      <section className="max-w-3xl mx-auto px-4 py-16 sm:py-24">
        <h2 className="font-display font-semibold text-2xl sm:text-3xl text-checkered text-center mb-14">
          Como funciona
        </h2>

        <div className="relative">
          <div className="absolute left-5 top-2 bottom-2 w-px bg-gradient-to-b from-racing via-asfalto-700 to-transparent sm:left-6" />

          <div className="space-y-10">
            {PASSOS.map((passo, i) => {
              const Icone = passo.icone;
              return (
                <div key={passo.titulo} className="relative flex gap-4 sm:gap-6 pl-0">
                  <div className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-asfalto-900 border-2 border-racing flex items-center justify-center shrink-0">
                    <Icone className="w-4 h-4 sm:w-5 sm:h-5 text-racing" />
                  </div>
                  <div className="pt-1">
                    <p className="text-xs text-asfalto-600 font-display tracking-wide mb-0.5">PASSO {i + 1}</p>
                    <h3 className="font-display font-semibold text-checkered text-lg">{passo.titulo}</h3>
                    <p className="text-sm text-asfalto-600 mt-1 max-w-md">{passo.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Recursos */}
      <section className="relative bg-asfalto-900/50 py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-flag-pattern bg-[length:24px_24px] opacity-[0.03] pointer-events-none" />

        <div className="relative max-w-3xl mx-auto px-4">
          <h2 className="font-display font-semibold text-2xl sm:text-3xl text-checkered text-center mb-12">
            O que já vem pronto
          </h2>

          <div className="grid sm:grid-cols-2 gap-4">
            {RECURSOS.map((recurso) => {
              const Icone = recurso.icone;
              return (
                <div
                  key={recurso.titulo}
                  className="flex gap-4 p-5 rounded-xl border border-asfalto-700 bg-asfalto-950/40"
                >
                  <div className={`w-10 h-10 rounded-lg ${recurso.corBg} flex items-center justify-center shrink-0`}>
                    <Icone className={`w-5 h-5 ${recurso.cor}`} />
                  </div>
                  <div>
                    <h3 className="font-medium text-checkered">{recurso.titulo}</h3>
                    <p className="text-sm text-asfalto-600 mt-0.5">{recurso.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final — bloco diagonal, fecha a página com impacto */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div
          className="absolute inset-0 bg-racing"
          style={{ clipPath: 'polygon(0 12%, 100% 0%, 100% 88%, 0% 100%)' }}
        />
        <div className="relative max-w-2xl mx-auto px-4 text-center">
          <h2 className="font-display font-bold text-2xl sm:text-4xl text-checkered">
            Bora organizar a próxima corrida?
          </h2>
          <p className="text-asfalto-950/80 mt-3 max-w-sm mx-auto font-medium">
            Entre com sua conta Google — se for a primeira vez, seu campeonato já é criado na hora.
          </p>
          <div className="mt-8 flex justify-center">
            <div className="bg-checkered rounded-full p-1">
              <BotaoGoogle onEntrar={irParaPainel} tema="outline" />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-8">
        <p className="text-center text-xs text-asfalto-600">Kart da Resenha — ranking de kart entre amigos</p>
      </footer>
    </div>
  );
}
