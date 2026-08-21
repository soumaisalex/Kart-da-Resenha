import { useRef, useState } from 'react';
import { Camera, X, Loader2, User } from 'lucide-react';

export default function FotoUpload({ valor, onChange }) {
  const inputRef = useRef(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function selecionarArquivo(arquivo) {
    if (!arquivo) return;
    setErro(null);
    setEnviando(true);
    try {
      const formData = new FormData();
      formData.append('foto', arquivo);

      const resp = await fetch('/api/upload', { method: 'POST', body: formData });
      const dados = await resp.json();
      if (!resp.ok) throw new Error(dados.erro || 'Não foi possível enviar a foto');

      onChange(dados.url);
    } catch (e) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm text-asfalto-600">Foto de perfil</span>
      <div className="flex items-center gap-3">
        <div className="w-16 h-16 rounded-full bg-asfalto-800 border border-asfalto-600 flex items-center justify-center overflow-hidden shrink-0">
          {enviando ? (
            <Loader2 className="w-5 h-5 animate-spin text-racing" />
          ) : valor ? (
            <img src={valor} alt="Foto de perfil" className="w-full h-full object-cover" />
          ) : (
            <User className="w-6 h-6 text-asfalto-600" />
          )}
        </div>

        <div className="flex flex-col gap-1">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={enviando}
            className="flex items-center gap-1.5 text-sm text-racing hover:text-racing-light disabled:opacity-60"
          >
            <Camera className="w-4 h-4" /> {valor ? 'Trocar foto' : 'Escolher foto'}
          </button>
          {valor && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="flex items-center gap-1.5 text-xs text-asfalto-600 hover:text-racing-light"
            >
              <X className="w-3 h-3" /> Remover
            </button>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => selecionarArquivo(e.target.files?.[0])}
        />
      </div>

      {erro && <p className="text-racing-light text-xs">{erro}</p>}
    </div>
  );
}
