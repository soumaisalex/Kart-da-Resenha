import { Flag, CalendarCheck, Share2, Layers, Trophy } from 'lucide-react';
import PodioIlustrativo from '../components/landing/PodioIlustrativo.jsx';
import BotaoGoogle from '../components/BotaoGoogle.jsx';

const PASSOS = [
  {
    numero: 1,
    titulo: 'Crie seu campeonato',
    texto: 'Dá um nome, e pronto — a pontuação já vem configurada, dá pra ajustar depois.'
  },
  {
    numero: 2,
    titulo: 'Fotografe a tabela de resultados',
    texto: 'Aquela folha impressa no fim da corrida, ou um print da tela do cronômetro — a leitura automática entende sozinha.'
  },
  {
    numero: 3,
    titulo: 'Revise e confirme',
    texto: 'Você sempre vê o que foi lido antes de publicar, e corrige na hora se precisar.'
  },
  {
    numero: 4,
    titulo: 'Cada piloto acompanha o próprio desempenho',
    texto: 'Reivindicando o perfil, aparecem estatísticas, posição no ranking e a evolução ao longo das corridas.'
  }
];

const RECURSOS = [
  {
    icone: Trophy,
    titulo: 'Ranking sempre atualizado',
    texto: 'Geral, por temporada e por corrida — recalculado automaticamente a cada resultado importado.'
  },
  {
    icone: CalendarCheck,
    titulo: 'Confirmação de presença',
    texto: 'Marca a próxima corrida e os pilotos confirmam direto pelo site, sem grupo de WhatsApp lotado.'
  },
  {
    icone: Share2,
    titulo: 'Card pra compartilhar',
    texto: 'Cada piloto gera uma imagem com o próprio desempenho, no formato certo pra postar no story.'
  },
  {
    icone: Layers,
    titulo: 'Seu campeonato, isolado',
    texto: 'Pilotos, resultados e pontuação não se misturam com nenhum outro campeonato da plataforma.'
  }
];

export default function Landing() {
  function irParaPainel() {
    window.location.href = '/painel';
  }

  return (
    <div className="min-h-screen">
      {/* Herói */}
      <header className="relative overflow-hidden border-b border-asfalto-700">
        <div className="absolute inset-x-0 top-0 h-1.5 bg-[repeating-linear-gradient(90deg,#ff3b30_0_16px,#f5f5f0_16px_32px)]" />

        <div className="max-w-5xl mx-auto px-4 pt-16 pb-14 sm:pt-24 sm:pb-20">
          <div className="flex items-center gap-2 justify-center mb-8">
            <Flag className="w-5 h-5 text-racing" />
            <span className="font-display font-semibold text-checkered tracking-wide">Grid</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-checkered text-center max-w-2xl mx-auto leading-tight">
            O ranking da sua resenha de kart, sem planilha
          </h1>
          <p className="text-asfalto-600 text-center max-w-md mx-auto mt-4 sm:text-lg">
            Tira uma foto da tabela de resultados. A leitura automática cuida do resto: pontuação,
            ranking e histórico de cada piloto, sempre em dia.
          </p>

          <div className="mt-8 flex justify-center">
            <BotaoGoogle onEntrar={irParaPainel} />
          </div>

          <div className="mt-14 sm:mt-16">
            <PodioIlustrativo />
          </div>
        </div>
      </header>

      {/* Como funciona */}
      <section className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
        <h2 className="font-display font-semibold text-2xl text-checkered text-center mb-12">
          Como funciona
        </h2>

        <div className="space-y-8">
          {PASSOS.map((passo) => (
            <div key={passo.numero} className="flex gap-4 sm:gap-5">
              <div className="w-9 h-9 rounded-full bg-asfalto-900 border border-racing/40 flex items-center justify-center shrink-0">
                <span className="font-display font-bold text-racing text-sm">{passo.numero}</span>
              </div>
              <div>
                <h3 className="font-display font-semibold text-checkered">{passo.titulo}</h3>
                <p className="text-sm text-asfalto-600 mt-1 max-w-md">{passo.texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recursos */}
      <section className="border-y border-asfalto-700 bg-asfalto-900/40">
        <div className="max-w-3xl mx-auto px-4 py-16 sm:py-20">
          <h2 className="font-display font-semibold text-2xl text-checkered text-center mb-10">
            O que já vem pronto
          </h2>

          <div className="divide-y divide-asfalto-700 border-t border-b border-asfalto-700">
            {RECURSOS.map((recurso) => {
              const Icone = recurso.icone;
              return (
                <div key={recurso.titulo} className="flex gap-4 py-5">
                  <Icone className="w-5 h-5 text-racing shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-checkered">{recurso.titulo}</h3>
                    <p className="text-sm text-asfalto-600 mt-0.5 max-w-md">{recurso.texto}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="max-w-2xl mx-auto px-4 py-16 sm:py-20 text-center">
        <h2 className="font-display font-bold text-2xl sm:text-3xl text-checkered">
          Bora organizar a próxima corrida?
        </h2>
        <p className="text-asfalto-600 mt-3 max-w-sm mx-auto">
          Entre com sua conta Google — se for a primeira vez, seu campeonato já é criado na hora.
        </p>
        <div className="mt-8 flex justify-center">
          <BotaoGoogle onEntrar={irParaPainel} tema="outline" />
        </div>
      </section>

      <footer className="border-t border-asfalto-700 py-8">
        <p className="text-center text-xs text-asfalto-600">Grid — ranking de kart entre amigos</p>
      </footer>
    </div>
  );
}
