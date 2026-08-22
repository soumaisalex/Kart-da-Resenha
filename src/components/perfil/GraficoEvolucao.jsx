import { useMemo, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatarDataCurta } from '../../lib/data.js';
import { msParaTempo } from '../../lib/tempo.js';

const METRICAS = [
  { id: 'posicao', label: 'Posição' },
  { id: 'melhor_volta', label: 'Melhor volta' },
  { id: 'vel_media', label: 'Vel. média' },
  { id: 'tempo_total', label: 'Tempo total x voltas' }
];

export default function GraficoEvolucao({ historico }) {
  const [metrica, setMetrica] = useState('posicao');

  const dados = useMemo(
    () =>
      historico.map((h) => ({
        label: formatarDataCurta(h.data_evento),
        posicao: h.posicao ?? null,
        melhor_volta: h.melhor_volta_ms != null ? h.melhor_volta_ms / 1000 : null,
        vel_media: h.vel_media != null ? Number(h.vel_media) : null,
        tempo_total: h.tempo_total_ms != null ? h.tempo_total_ms / 1000 : null,
        total_voltas: h.total_voltas ?? null
      })),
    [historico]
  );

  if (!dados.length) return null;

  const maxPosicao = Math.max(...dados.map((d) => d.posicao || 1), 1);

  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {METRICAS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMetrica(m.id)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              metrica === m.id
                ? 'bg-racing border-racing text-checkered'
                : 'border-asfalto-600 text-asfalto-600 hover:text-checkered'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#262a32" />
          <XAxis
            dataKey="label"
            tick={{ fill: '#3a3f4a', fontSize: 11 }}
            axisLine={{ stroke: '#262a32' }}
            tickLine={false}
          />

          {metrica === 'posicao' && (
            <>
              <YAxis
                reversed
                domain={[1, maxPosicao]}
                allowDecimals={false}
                tick={{ fill: '#3a3f4a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${v}º`}
                width={32}
              />
              <Tooltip content={<TooltipSimples formatador={(v) => `${v}º lugar`} />} />
              <Line type="monotone" dataKey="posicao" stroke="#ff3b30" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </>
          )}

          {metrica === 'melhor_volta' && (
            <>
              <YAxis
                tick={{ fill: '#3a3f4a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => msParaTempo(v * 1000)}
                width={56}
              />
              <Tooltip content={<TooltipSimples formatador={(v) => msParaTempo(v * 1000)} />} />
              <Line type="monotone" dataKey="melhor_volta" stroke="#ff3b30" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </>
          )}

          {metrica === 'vel_media' && (
            <>
              <YAxis tick={{ fill: '#3a3f4a', fontSize: 11 }} axisLine={false} tickLine={false} width={40} />
              <Tooltip content={<TooltipSimples formatador={(v) => `${v} km/h`} />} />
              <Line type="monotone" dataKey="vel_media" stroke="#ff3b30" strokeWidth={2} dot={{ r: 3 }} connectNulls />
            </>
          )}

          {metrica === 'tempo_total' && (
            <>
              <YAxis
                yAxisId="tempo"
                tick={{ fill: '#3a3f4a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => msParaTempo(v * 1000)}
                width={56}
              />
              <YAxis
                yAxisId="voltas"
                orientation="right"
                tick={{ fill: '#3a3f4a', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={32}
              />
              <Tooltip content={<TooltipDuplo />} />
              <Line
                yAxisId="tempo"
                type="monotone"
                dataKey="tempo_total"
                stroke="#ff3b30"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
                name="tempo_total"
              />
              <Line
                yAxisId="voltas"
                type="monotone"
                dataKey="total_voltas"
                stroke="#d4af37"
                strokeWidth={2}
                dot={{ r: 3 }}
                connectNulls
                name="total_voltas"
              />
            </>
          )}
        </LineChart>
      </ResponsiveContainer>

      {metrica === 'tempo_total' && (
        <div className="flex items-center gap-4 justify-center mt-2 text-[11px] text-asfalto-600">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-racing" /> Tempo total</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-ouro" /> Nº de voltas</span>
        </div>
      )}
    </div>
  );
}

function TooltipSimples({ active, payload, label, formatador }) {
  if (!active || !payload?.length) return null;
  const valor = payload[0]?.value;
  if (valor == null) return null;
  return (
    <div className="bg-asfalto-900 border border-asfalto-700 rounded-lg px-3 py-2 text-xs">
      <p className="text-asfalto-600 mb-0.5">{label}</p>
      <p className="text-checkered font-display font-semibold">{formatador(valor)}</p>
    </div>
  );
}

function TooltipDuplo({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-asfalto-900 border border-asfalto-700 rounded-lg px-3 py-2 text-xs space-y-0.5">
      <p className="text-asfalto-600 mb-0.5">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="font-display font-semibold" style={{ color: p.color }}>
          {p.dataKey === 'tempo_total' ? msParaTempo(p.value * 1000) : `${p.value} voltas`}
        </p>
      ))}
    </div>
  );
}
