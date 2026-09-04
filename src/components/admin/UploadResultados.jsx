import { useState, useRef } from 'react';
import { UploadCloud, Loader2 } from 'lucide-react';
import { useCampeonato } from '../../context/CampeonatoContext.jsx';

export default function UploadResultados({ onExtraido }) {
  const { apiUrl } = useCampeonato();
  const [arrastando, setArrastando] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState(null);
  const inputRef = useRef(null);

  async function enviarArquivo(arquivo) {
    if (!arquivo) return;
    setErro(null);
    setCarregando(true);

    try {
      const formData = new FormData();
      formData.append('arquivo', arquivo);

      const resp = await fetch(apiUrl('/ocr'), { method: 'POST', body: formData });
      const dados = await resp.json();

      if (!resp.ok) {
        const partes = [dados.erro || 'Não foi possível ler o arquivo'];
        if (dados.detalhe) partes.push(`detalhe: ${dados.detalhe}`);
        if (dados.detalhe_parse) partes.push(`erro do parser: ${dados.detalhe_parse}`);
        if (dados.bruto) {
          const brutoTexto = typeof dados.bruto === 'string' ? dados.bruto : JSON.stringify(dados.bruto);
          partes.push(`resposta da IA (completa): ${brutoTexto}`);
        }
        throw new Error(partes.join(' — '));
      }

      onExtraido(dados);
    } catch (e) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="w-full">
      <div
        onDragOver={(e) => { e.preventDefault(); setArrastando(true); }}
        onDragLeave={() => setArrastando(false)}
        onDrop={(e) => {
          e.preventDefault();
          setArrastando(false);
          enviarArquivo(e.dataTransfer.files?.[0]);
        }}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors
          ${arrastando ? 'border-racing bg-racing/5' : 'border-asfalto-600 hover:border-asfalto-600/80'}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => enviarArquivo(e.target.files?.[0])}
        />

        {carregando ? (
          <div className="flex flex-col items-center gap-3 text-checkered">
            <Loader2 className="w-8 h-8 animate-spin text-racing" />
            <p className="font-display font-medium">Lendo a tabela de resultados...</p>
            <p className="text-sm text-asfalto-600">Isso pode levar até um minuto</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-checkered">
            <UploadCloud className="w-8 h-8 text-racing" />
            <p className="font-display font-medium">Envie a foto da tabela de resultados</p>
            <p className="text-sm text-asfalto-600">Clique aqui ou arraste o arquivo — JPG ou PNG (PDF ainda não é suportado)</p>
          </div>
        )}
      </div>

      {erro && (
        <p className="mt-3 text-sm text-racing-light max-h-48 overflow-y-auto whitespace-pre-wrap">
          Não deu certo: {erro}
        </p>
      )}
    </div>
  );
}
