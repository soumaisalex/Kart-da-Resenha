import { useEffect, useState } from 'react';
import { Check, AlertTriangle, Loader2, User, Trash2, Plus } from 'lucide-react';
import { tempoParaMs } from '../../lib/tempo.js';
import { sugerirPiloto } from '../../lib/pilotoMatching.js';
import { formatarData } from '../../lib/data.js';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function RevisaoResultados({ dadosExtraidos, onImportado, onCancelar }) {
  const { apiUrl } = useCampeonato();
  const [eventos, setEventos] = useState([]);
  const [eventoSelecionadoId, setEventoSelecionadoId] = useState(''); // '' = criar novo evento

  const [evento, setEvento] = useState({
    nome: dadosExtraidos.evento?.descricao_bateria || '',
    data_evento: dadosExtraidos.evento?.data || '',
    local: dadosExtraidos.evento?.local || ''
  });
  const [bateria, setBateria] = useState({
    descricao: dadosExtraidos.evento?.descricao_bateria || '',
    horario: ''
  });
  const [linhas, setLinhas] = useState(
    (dadosExtraidos.resultados || []).map((r) => ({
      nome_bruto: r.nome ?? '',
      posicao: r.posicao ?? '',
      numero_kart: r.numero_kart ?? '',
      melhor_volta: r.melhor_volta ?? '',
      tempo_total: r.tempo_total ?? '',
      gap_texto: r.gap ?? '',
      total_voltas: r.total_voltas ?? '',
      vel_media: r.vel_media ?? '',
      piloto_id: null,
      sugestao: null
    }))
  );
  const [pilotos, setPilotos] = useState([]);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  // Carrega pilotos aprovados (pra sugerir vínculo) e eventos já cadastrados (pra permitir
  // anexar essa bateria a um evento existente em vez de criar um novo automaticamente)
  useEffect(() => {
    fetch(apiUrl('/pilotos'))
      .then((r) => r.json())
      .then((lista) => {
        setPilotos(lista);
        setLinhas((atual) =>
          atual.map((linha) => {
            const sugestao = sugerirPiloto(linha.nome_bruto, lista);
            return {
              ...linha,
              piloto_id: sugestao ? sugestao.piloto.id : null,
              sugestao
            };
          })
        );
      })
      .catch(() => {});

    fetch(apiUrl('/eventos'))
      .then((r) => r.json())
      .then(setEventos)
      .catch(() => {});
  }, []);

  const eventoSelecionado = eventos.find((e) => String(e.id) === String(eventoSelecionadoId));

  function atualizarLinha(index, campo, valor) {
    setLinhas((atual) => atual.map((l, i) => (i === index ? { ...l, [campo]: valor } : l)));
  }

  function adicionarLinha() {
    const proximaPosicao = linhas.length ? Math.max(...linhas.map((l) => Number(l.posicao) || 0)) + 1 : 1;
    setLinhas((atual) => [
      ...atual,
      {
        nome_bruto: '',
        posicao: proximaPosicao,
        numero_kart: '',
        melhor_volta: '',
        tempo_total: '',
        gap_texto: '',
        total_voltas: '',
        vel_media: '',
        piloto_id: null,
        sugestao: null
      }
    ]);
  }

  function removerLinha(index) {
    setLinhas((atual) => atual.filter((_, i) => i !== index));
  }

  async function confirmarImportacao() {
    setErro(null);

    if (!eventoSelecionadoId && !evento.data_evento) {
      setErro('Informe a data do evento, ou selecione um evento existente.');
      return;
    }

    const resultadosInvalidos = linhas.filter((l) => !l.nome_bruto || !l.posicao);
    if (resultadosInvalidos.length) {
      setErro('Toda linha precisa de nome e posição preenchidos.');
      return;
    }

    setEnviando(true);
    try {
      const payload = {
        evento: eventoSelecionadoId
          ? { id: Number(eventoSelecionadoId), arquivo_original_url: dadosExtraidos.arquivo_original_url }
          : { ...evento, arquivo_original_url: dadosExtraidos.arquivo_original_url },
        bateria,
        resultados: linhas.map((l) => ({
          nome_bruto: l.nome_bruto,
          piloto_id: l.piloto_id || null,
          posicao: Number(l.posicao),
          numero_kart: l.numero_kart ? Number(l.numero_kart) : null,
          melhor_volta_ms: tempoParaMs(l.melhor_volta),
          tempo_total_ms: tempoParaMs(l.tempo_total),
          gap_texto: l.gap_texto || null,
          total_voltas: l.total_voltas ? Number(l.total_voltas) : null,
          vel_media: l.vel_media ? Number(l.vel_media) : null
        }))
      };

      const resp = await fetch(apiUrl('/resultados/importar'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível importar');

      onImportado(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display font-semibold text-xl text-checkered">Confira antes de importar</h2>
        <p className="text-sm text-asfalto-600 mt-1">
          A leitura automática pode errar algum campo — corrija o que precisar antes de confirmar.
        </p>
      </div>

      {/* Escolha: anexar a um evento já existente, ou criar um novo */}
      <div>
        <label className="flex flex-col gap-1 text-sm max-w-md">
          <span className="text-asfalto-600">Evento</span>
          <select
            value={eventoSelecionadoId}
            onChange={(e) => setEventoSelecionadoId(e.target.value)}
            className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
          >
            <option value="">+ Criar novo evento</option>
            {eventos.map((e) => (
              <option key={e.id} value={e.id}>
                {formatarData(e.data_evento)} — {e.nome || e.local || 'Corrida'}
                {e.tipo === 'futuro' ? ' (agendada)' : ''}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Dados do evento — só editáveis se for criar um evento novo */}
      {!eventoSelecionadoId && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Campo label="Data do evento" tipo="date" valor={evento.data_evento}
            onChange={(v) => setEvento({ ...evento, data_evento: v })} />
          <Campo label="Local" valor={evento.local}
            onChange={(v) => setEvento({ ...evento, local: v })} />
        </div>
      )}

      {/* Descrição da bateria — sempre editável, cada bateria é independente mesmo dentro do mesmo evento */}
      <div className="max-w-xs">
        <Campo label="Descrição da bateria" valor={bateria.descricao}
          onChange={(v) => setBateria({ ...bateria, descricao: v })} />
      </div>

      {/* Tabela de resultados */}
      <div className="overflow-x-auto rounded-lg border border-asfalto-700">
        <table className="w-full text-sm text-checkered">
          <thead className="bg-asfalto-800 text-asfalto-600 uppercase text-xs">
            <tr>
              <Th>Pos</Th>
              <Th>Kart</Th>
              <Th>Nome (lido)</Th>
              <Th>Vincular perfil</Th>
              <Th>Melhor volta</Th>
              <Th>Tempo total</Th>
              <Th>Gap</Th>
              <Th>Voltas</Th>
              <Th>Vel. média</Th>
              <Th></Th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((linha, i) => (
              <tr key={i} className="border-t border-asfalto-700">
                <Td><InputCel valor={linha.posicao} onChange={(v) => atualizarLinha(i, 'posicao', v)} largura="w-12" /></Td>
                <Td><InputCel valor={linha.numero_kart} onChange={(v) => atualizarLinha(i, 'numero_kart', v)} largura="w-14" /></Td>
                <Td><InputCel valor={linha.nome_bruto} onChange={(v) => atualizarLinha(i, 'nome_bruto', v)} largura="w-36" /></Td>
                <Td>
                  <SelecionarPiloto
                    pilotos={pilotos}
                    valor={linha.piloto_id}
                    sugestao={linha.sugestao}
                    onChange={(v) => atualizarLinha(i, 'piloto_id', v)}
                  />
                </Td>
                <Td><InputCel valor={linha.melhor_volta} onChange={(v) => atualizarLinha(i, 'melhor_volta', v)} largura="w-24" placeholder="mm:ss.mmm" /></Td>
                <Td><InputCel valor={linha.tempo_total} onChange={(v) => atualizarLinha(i, 'tempo_total', v)} largura="w-28" placeholder="hh:mm:ss.mmm" /></Td>
                <Td><InputCel valor={linha.gap_texto} onChange={(v) => atualizarLinha(i, 'gap_texto', v)} largura="w-20" /></Td>
                <Td><InputCel valor={linha.total_voltas} onChange={(v) => atualizarLinha(i, 'total_voltas', v)} largura="w-14" /></Td>
                <Td><InputCel valor={linha.vel_media} onChange={(v) => atualizarLinha(i, 'vel_media', v)} largura="w-16" /></Td>
                <Td>
                  <button
                    onClick={() => removerLinha(i)}
                    className="text-asfalto-600 hover:text-racing-light"
                    aria-label="Remover linha"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button
        onClick={adicionarLinha}
        className="flex items-center gap-1.5 text-sm text-racing hover:text-racing-light"
      >
        <Plus className="w-4 h-4" /> Adicionar piloto
      </button>

      {erro && (
        <p className="flex items-center gap-2 text-racing-light text-sm">
          <AlertTriangle className="w-4 h-4" /> {erro}
        </p>
      )}

      <div className="flex gap-3">
        <button
          onClick={confirmarImportacao}
          disabled={enviando}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-racing hover:bg-racing-dark
                     text-checkered font-display font-semibold disabled:opacity-60"
        >
          {enviando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
          Confirmar importação
        </button>
        <button
          onClick={onCancelar}
          disabled={enviando}
          className="px-5 py-2.5 rounded-lg border border-asfalto-600 text-checkered hover:bg-asfalto-800"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

function SelecionarPiloto({ pilotos, valor, sugestao, onChange }) {
  return (
    <div className="flex flex-col gap-0.5">
      <select
        value={valor ?? ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="w-40 bg-asfalto-800 border border-asfalto-600 rounded px-2 py-1 text-checkered text-sm"
      >
        <option value="">Sem vínculo ainda</option>
        {pilotos.map((p) => (
          <option key={p.id} value={p.id}>{p.nome}</option>
        ))}
      </select>
      {sugestao && valor === sugestao.piloto.id && (
        <span className="flex items-center gap-1 text-[11px] text-asfalto-600">
          <User className="w-3 h-3" /> sugerido ({Math.round(sugestao.score * 100)}% parecido)
        </span>
      )}
    </div>
  );
}

function Campo({ label, valor, onChange, tipo = 'text' }) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="text-asfalto-600">{label}</span>
      <input
        type={tipo}
        value={valor}
        onChange={(e) => onChange(e.target.value)}
        className="bg-asfalto-800 border border-asfalto-600 rounded px-3 py-2 text-checkered"
      />
    </label>
  );
}

function InputCel({ valor, onChange, largura = 'w-24', placeholder }) {
  return (
    <input
      value={valor ?? ''}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className={`${largura} bg-transparent border border-transparent hover:border-asfalto-600
                  focus:border-racing rounded px-2 py-1 text-checkered text-sm outline-none`}
    />
  );
}

function Th({ children }) {
  return <th className="text-left px-3 py-2 font-medium">{children}</th>;
}
function Td({ children }) {
  return <td className="px-3 py-1.5">{children}</td>;
}
