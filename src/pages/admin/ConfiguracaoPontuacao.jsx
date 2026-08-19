import { useEffect, useState } from 'react';
import { Loader2, Plus, Trash2, Save, CheckCircle2 } from 'lucide-react';

export default function ConfiguracaoPontuacao() {
  const [posicoes, setPosicoes] = useState(null);
  const [pontosVoltaRapida, setPontosVoltaRapida] = useState(0);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState(null);
  const [salvo, setSalvo] = useState(false);

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    const resp = await fetch('/api/config/pontuacao');
    const dados = await resp.json();
    setPosicoes(dados.posicoes.map((p) => ({ posicao: p.posicao, pontos: Number(p.pontos) })));
    setPontosVoltaRapida(Number(dados.pontos_melhor_volta));
  }

  function atualizarPontos(index, valor) {
    setSalvo(false);
    setPosicoes((atual) => atual.map((p, i) => (i === index ? { ...p, pontos: Number(valor) } : p)));
  }

  function removerLinha(index) {
    setSalvo(false);
    setPosicoes((atual) => atual.filter((_, i) => i !== index));
  }

  function adicionarLinha() {
    setSalvo(false);
    const proximaPosicao = posicoes.length ? Math.max(...posicoes.map((p) => p.posicao)) + 1 : 1;
    setPosicoes((atual) => [...atual, { posicao: proximaPosicao, pontos: 0 }]);
  }

  async function salvar() {
    setErro(null);
    setSalvando(true);
    try {
      const resp = await fetch('/api/config/pontuacao', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ posicoes, pontos_melhor_volta: pontosVoltaRapida })
      });
      if (!resp.ok) {
        const dados = await resp.json();
        throw new Error(dados.erro || 'Não foi possível salvar');
      }
      setSalvo(true);
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvando(false);
    }
  }

  if (posicoes === null) {
    return <Loader2 className="w-5 h-5 animate-spin text-racing" />;
  }

  return (
    <div className="max-w-md space-y-8">
      <div>
        <h2 className="font-display font-semibold text-xl text-checkered mb-1">Pontuação por posição</h2>
        <p className="text-asfalto-600 text-sm mb-4">
          Pontos atribuídos a cada posição de chegada em cada bateria.
        </p>

        <div className="space-y-2">
          {posicoes
            .sort((a, b) => a.posicao - b.posicao)
            .map((linha, i) => (
              <div key={linha.posicao} className="flex items-center gap-3">
                <span className="w-10 font-display text-checkered text-sm">{linha.posicao}º</span>
                <input
                  type="number"
                  value={linha.pontos}
                  onChange={(e) => atualizarPontos(i, e.target.value)}
                  className="flex-1 bg-asfalto-800 border border-asfalto-600 rounded px-3 py-1.5 text-checkered text-sm"
                />
                <span className="text-xs text-asfalto-600 w-8">pts</span>
                <button
                  onClick={() => removerLinha(i)}
                  className="text-asfalto-600 hover:text-racing-light"
                  aria-label="Remover posição"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
        </div>

        <button
          onClick={adicionarLinha}
          className="flex items-center gap-1.5 text-sm text-racing hover:text-racing-light mt-3"
        >
          <Plus className="w-4 h-4" /> Adicionar posição
        </button>
      </div>

      <div>
        <h2 className="font-display font-semibold text-xl text-checkered mb-1">Volta mais rápida</h2>
        <p className="text-asfalto-600 text-sm mb-3">
          Pontos extras pra quem fizer a volta mais rápida de cada bateria.
        </p>
        <div className="flex items-center gap-3">
          <input
            type="number"
            value={pontosVoltaRapida}
            onChange={(e) => { setSalvo(false); setPontosVoltaRapida(Number(e.target.value)); }}
            className="w-24 bg-asfalto-800 border border-asfalto-600 rounded px-3 py-1.5 text-checkered text-sm"
          />
          <span className="text-xs text-asfalto-600">pts</span>
        </div>
      </div>

      {erro && <p className="text-racing-light text-sm">{erro}</p>}

      <div className="flex items-center gap-3">
        <button
          onClick={salvar}
          disabled={salvando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-racing hover:bg-racing-dark
                     text-checkered font-display font-semibold disabled:opacity-60"
        >
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Salvar configuração
        </button>
        {salvo && (
          <span className="flex items-center gap-1.5 text-sm text-racing">
            <CheckCircle2 className="w-4 h-4" /> Salvo
          </span>
        )}
      </div>

      <p className="text-xs text-asfalto-600 border-t border-asfalto-700 pt-4">
        Atenção: alterar a pontuação aqui não recalcula corridas já importadas — só vale pras próximas.
      </p>
    </div>
  );
}
