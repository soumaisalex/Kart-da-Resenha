import { useParams } from 'react-router-dom';

export default function PerfilPiloto() {
  const { id } = useParams();

  // TODO próxima etapa:
  // - Dados + estatísticas (melhor volta, nº corridas, evolução)
  // - Ranking geral/temporada/evento com o piloto destacado
  // - Botão "Reivindicar perfil" (se ainda não reivindicado)
  // - Modal com card de compartilhamento estilo Stories (html-to-image + Web Share API)
  return (
    <main className="max-w-3xl mx-auto px-4 py-10">
      <p className="text-checkered">Perfil do piloto #{id} — em construção.</p>
    </main>
  );
}
