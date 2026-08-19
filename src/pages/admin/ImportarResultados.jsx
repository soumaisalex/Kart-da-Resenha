import { useState } from 'react';
import { CheckCircle2, RotateCcw, UploadCloud, PenLine } from 'lucide-react';
import UploadResultados from '../../components/admin/UploadResultados.jsx';
import RevisaoResultados from '../../components/admin/RevisaoResultados.jsx';

export default function ImportarResultados() {
  const [etapa, setEtapa] = useState('escolha'); // escolha | upload | revisao | concluido
  const [dadosExtraidos, setDadosExtraidos] = useState(null);
  const [resultadoImport, setResultadoImport] = useState(null);

  function iniciarManual() {
    setDadosExtraidos({ evento: {}, resultados: [] });
    setEtapa('revisao');
  }

  function reiniciar() {
    setEtapa('escolha');
    setDadosExtraidos(null);
    setResultadoImport(null);
  }

  return (
    <div>
      <h2 className="font-display font-semibold text-xl text-checkered mb-1">Resultados de corrida</h2>
      <p className="text-asfalto-600 mb-6">Importe por foto/PDF ou cadastre manualmente</p>

      {etapa === 'escolha' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => setEtapa('upload')}
            className="flex flex-col items-center gap-3 border-2 border-dashed border-asfalto-600
                       hover:border-racing rounded-xl p-8 text-checkered transition-colors"
          >
            <UploadCloud className="w-8 h-8 text-racing" />
            <div className="text-center">
              <p className="font-display font-medium">Importar com OCR</p>
              <p className="text-sm text-asfalto-600 mt-1">Envie a foto ou PDF da tabela de resultados</p>
            </div>
          </button>

          <button
            onClick={iniciarManual}
            className="flex flex-col items-center gap-3 border-2 border-dashed border-asfalto-600
                       hover:border-racing rounded-xl p-8 text-checkered transition-colors"
          >
            <PenLine className="w-8 h-8 text-racing" />
            <div className="text-center">
              <p className="font-display font-medium">Adicionar manualmente</p>
              <p className="text-sm text-asfalto-600 mt-1">Digite os resultados direto na tabela</p>
            </div>
          </button>
        </div>
      )}

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
          onCancelar={reiniciar}
        />
      )}

      {etapa === 'concluido' && (
        <div className="flex flex-col items-center gap-4 py-10 text-center">
          <CheckCircle2 className="w-12 h-12 text-racing" />
          <div>
            <p className="font-display font-semibold text-lg text-checkered">Resultados salvos!</p>
            <p className="text-asfalto-600 text-sm mt-1">
              {resultadoImport?.resultados?.length} resultado(s) gravado(s) e pontuação calculada.
            </p>
          </div>
          <button
            onClick={reiniciar}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-asfalto-600
                       text-checkered hover:bg-asfalto-800"
          >
            <RotateCcw className="w-4 h-4" /> Adicionar outra corrida
          </button>
        </div>
      )}
    </div>
  );
}
