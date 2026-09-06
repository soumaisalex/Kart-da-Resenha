import { useEffect, useState } from 'react';
import { X, Loader2, Trash2, Save } from 'lucide-react';
import { tempoParaMs, msParaTempo } from '../../lib/tempo.js';
import { formatarDataAbrev } from '../../lib/data.js';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function ResultadosDoParticipanteModal({ participante, onFechar }) {
  const { apiUrl } = useCampeonato();
  const [linhas, setLinhas] = useState(null);
  const [salvandoId, setSalvandoId] = useState(null);
  const [excluindoId, setExcluindoId] = useState(null);
  const [erro, setErro] = useState(null);

  const query = participante.vinculado
    ? `piloto_id=${participante.piloto_id}`
    : `nome_bruto=${encodeURIComponent(participante.nome_bruto)}`;

  useEffect(() => {
    carregar();
  }, []);

  async function carregar() {
    setErro(null);
    try {
      const resp = await fetch(apiUrl(`/resultados?${query}`));
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível carregar os resultados');
      setLinhas(
        dados.map((r) => ({
          ...r,
          _melhor_volta_texto: r.melhor_volta_ms != null ? msParaTempo(r.melhor_volta_ms) : '',
          _tempo_total_texto: r.tempo_total_ms != null ? msParaTempo(r.tempo_total_ms) : ''
        }))
      );
    } catch (e) {
      setErro(e.message);
      setLinhas([]);
    }
  }

  function atualizarCampo(id, campo, valor) {
    setLinhas((atual) => atual.map((l) => (l.id === id ? { ...l, [campo]: valor } : l)));
  }

  async function salvarLinha(linha) {
    setSalvandoId(linha.id);
    setErro(null);
    try {
      const corpo = {
        nome_bruto: linha.nome_bruto,
        posicao: Number(linha.posicao),
        numero_kart: linha.numero_kart !== '' ? Number(linha.numero_kart) : null,
        melhor_volta_ms: tempoParaMs(linha._melhor_volta_texto),
        tempo_total_ms: tempoParaMs(linha._tempo_total_texto),
        gap_texto: linha.gap_texto,
        total_voltas: linha.total_voltas !== '' ? Number(linha.total_voltas) : null,
        vel_media: linha.vel_media !== '' ? Number(linha.vel_media) : null
      };
      const resp = await fetch(apiUrl(`/resultados/${linha.id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corpo)
      });
      if (!resp.ok) {
        const dados = await resp.json();
        throw new Error(dados.erro || 'Não foi possível salvar');
      }
      await carregar(); // recarrega pra refletir pontos recalculados (inclusive de outras linhas da mesma bateria)
    } catch (e) {
      setErro(e.message);
    } finally {
      setSalvandoId(null);
    }
  }

  async function excluirLinha(id) {
    setExcluindoId(id);
    setErro(null);
    try {
      const resp = await fetch(apiUrl(`/resultados/${id}`), { method: 'DELETE' });
      if (!resp.ok) throw new Error('Não foi possível excluir');
      setLinhas((atual) => atual.filter((l) => l.id !== id));
    } catch (e) {
      setErro(e.message);
    } finally {
      setExcluindoId(null);
    }
  }

  const nomeExibido = participante.vinculado ? participante.nome : participante.nome_bruto;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center px-4">
      <div className="w-full max-w-3xl max-h-[85vh] overflow-y-auto bg-asfalto-900 border border-asfalto-700 rounded-xl p-6 relative">
        <button onClick={onFechar} className="absolute top-4 right-4 text-asfalto-600 hover:text-checkered">
          <X className="w-5 h-5" />
        </button>

        <h2 className="font-display font-semibold text-lg text-checkered mb-1">Resultados de {nomeExibido}</h2>
        <p className="text-sm text-asfalto-600 mb-5">
          Editar posição ou volta recalcula os pontos automaticamente (inclusive o bônus de volta
          mais rápida, comparado com o resto da bateria).
        </p>

        {erro && <p className="text-racing-light text-sm mb-3">{erro}</p>}

        {linhas === null && (
          <div className="flex items-center gap-2 text-asfalto-600">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
          </div>
        )}

        {linhas?.length === 0 && <p className="text-asfalto-600 text-sm">Nenhum resultado encontrado.</p>}

        {linhas?.length > 0 && (
          <div className="overflow-x-auto rounded-lg border border-asfalto-700">
            <table className="w-full text-sm text-checkered">
              <thead className="bg-asfalto-800 text-asfalto-600 uppercase text-xs">
                <tr>
                  <Th>Evento</Th>
                  <Th>Pos</Th>
                  <Th>Kart</Th>
                  <Th>Nome (bruto)</Th>
                  <Th>Melhor volta</Th>
                  <Th>Tempo total</Th>
                  <Th>Gap</Th>
                  <Th>Voltas</Th>
                  <Th>Vel. média</Th>
                  <Th>Pontos</Th>
                  <Th></Th>
                </tr>
              </thead>
              <tbody>
                {linhas.map((linha) => (
                  <tr key={linha.id} className="border-t border-asfalto-700">
                    <Td>
                      <span className="text-xs text-asfalto-600 whitespace-nowrap">
                        {formatarDataAbrev(linha.data_evento)}
                        {linha.bateria_descricao ? ` · ${linha.bateria_descricao}` : ''}
                      </span>
                    </Td>
                    <Td><InputCel valor={linha.posicao} onChange={(v) => atualizarCampo(linha.id, 'posicao', v)} largura="w-12" /></Td>
                    <Td><InputCel valor={linha.numero_kart ?? ''} onChange={(v) => atualizarCampo(linha.id, 'numero_kart', v)} largura="w-14" /></Td>
                    <Td><InputCel valor={linha.nome_bruto} onChange={(v) => atualizarCampo(linha.id, 'nome_bruto', v)} largura="w-32" /></Td>
                    <Td><InputCel valor={linha._melhor_volta_texto} onChange={(v) => atualizarCampo(linha.id, '_melhor_volta_texto', v)} largura="w-24" placeholder="mm:ss.mmm" /></Td>
                    <Td><InputCel valor={linha._tempo_total_texto} onChange={(v) => atualizarCampo(linha.id, '_tempo_total_texto', v)} largura="w-28" placeholder="hh:mm:ss.mmm" /></Td>
                    <Td><InputCel valor={linha.gap_texto ?? ''} onChange={(v) => atualizarCampo(linha.id, 'gap_texto', v)} largura="w-20" /></Td>
                    <Td><InputCel valor={linha.total_voltas ?? ''} onChange={(v) => atualizarCampo(linha.id, 'total_voltas', v)} largura="w-14" /></Td>
                    <Td><InputCel valor={linha.vel_media ?? ''} onChange={(v) => atualizarCampo(linha.id, 'vel_media', v)} largura="w-16" /></Td>
                    <Td>
                      <span className="text-xs text-racing font-display font-semibold whitespace-nowrap">
                        {Number(linha.pontos_posicao) + Number(linha.pontos_volta_rapida)} pts
                        {Number(linha.pontos_volta_rapida) > 0 && (
                          <span className="block text-ouro text-[10px]">+{Number(linha.pontos_volta_rapida)} volta</span>
                        )}
                      </span>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => salvarLinha(linha)}
                          disabled={salvandoId === linha.id}
                          className="text-racing hover:text-racing-light disabled:opacity-60"
                          aria-label="Salvar"
                        >
                          {salvandoId === linha.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => excluirLinha(linha.id)}
                          disabled={excluindoId === linha.id}
                          className="text-asfalto-600 hover:text-racing-light disabled:opacity-60"
                          aria-label="Excluir"
                        >
                          {excluindoId === linha.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                        </button>
                      </div>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function InputCel({ valor, onChange, largura = 'w-24', placeholder }) {
  return (
    <input
      value={valor ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${largura} bg-asfalto-800 border border-transparent hover:border-asfalto-600
                  focus:border-racing rounded px-2 py-1 text-checkered text-sm outline-none`}
    />
  );
}

function Th({ children }) {
  return <th className="text-left px-3 py-2 font-medium whitespace-nowrap">{children}</th>;
}
function Td({ children }) {
  return <td className="px-3 py-1.5">{children}</td>;
}
