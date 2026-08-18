import { useState } from 'react';
import { CheckCircle2, RotateCcw } from 'lucide-react';
import UploadResultados from '../components/admin/UploadResultados.jsx';
import RevisaoResultados from '../components/admin/RevisaoResultados.jsx';

// TODO próxima etapa:
// - Login admin (esta página ainda não está protegida por sessão)
// - Fila de aprovação de perfis (pilotos com status = pendente)
// - Configuração de pontuação (posição + volta mais rápida)
// - Seção de eventos: criar futuro, ver confirmados, ver resultados de passados
export default function Admin() {
  const [etapa, setEtapa] = useState('upload'); // upload | revisao | concluido
  const [dadosExtraidos, setDadosExtraidos] = useState(null);
  const [resultadoImport, setResultadoImport] = useState(null);

  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl text-checkered mb-1">Área Administrativa</h1>
      <p className="text-asfalto-600 mb-8">Importar resultados de uma corrida</p>

      {etapa === 'upload' && (
        <UploadResultados
          onExtraido={(dados) => {
            setDadosExtraidos(dados);
            setEtapa('revisao');
          }}
        />
      )}

      {etapa === 'revisao' && dadosExtraidos && (
        <RevisaoResultados
          dadosExtraidos={dadosExtraidos}
          onImportado={(resultado) => {
            setResultadoImport(resultado);
            setEtapa('concluido');
          }}
          onCancelar={() => {
            setDadosExtraidos(null);
            setEtapa('upload');
          }}
        />
      )}

      {etapa === 'concluido' && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-racing" />
          <div>
            <p className="font-display font-semibold text-lg text-checkered">Resultados importados!</p>
            <p className="text-asfalto-600 text-sm mt-1">
              {resultadoImport?.resultados?.length} resultado(s) gravado(s) e pontuação calculada.
            </p>
          </div>
          <button
            onClick={() => { setEtapa('upload'); setDadosExtraidos(null); setResultadoImport(null); }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-asfalto-600
                       text-checkered hover:bg-asfalto-800"
          >
            <RotateCcw className="w-4 h-4" /> Importar outra corrida
          </button>
        </div>
      )}
    </main>
  );
}
