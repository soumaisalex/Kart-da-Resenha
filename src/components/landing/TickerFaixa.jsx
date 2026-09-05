const FRASES = [
  'SEM PLANILHA',
  'RANKING AUTOMÁTICO',
  'FOTO VIRA RESULTADO',
  'CADA CAMPEONATO ISOLADO',
  'CONFIRMAÇÃO DE PRESENÇA',
  'CARD PRA COMPARTILHAR'
];

export default function TickerFaixa() {
  const conteudo = (
    <div className="flex items-center gap-10 shrink-0 pr-10">
      {FRASES.map((frase) => (
        <span key={frase} className="flex items-center gap-10">
          <span className="font-display font-semibold text-asfalto-950 text-sm sm:text-base tracking-wide whitespace-nowrap">
            {frase}
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-asfalto-950/40 shrink-0" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="bg-racing py-3 overflow-hidden -rotate-1 scale-105">
      <div className="flex w-max animate-marquee">
        {conteudo}
        {conteudo}
      </div>
    </div>
  );
}
