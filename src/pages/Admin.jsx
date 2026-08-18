export default function Admin() {
  // TODO próxima etapa:
  // - Login admin
  // - Upload imagem/PDF -> OCR (Workers AI) -> tela de revisão -> confirmar import
  // - Fila de aprovação de perfis (pilotos com status = pendente)
  // - Configuração de pontuação (posição + volta mais rápida)
  // - Seção de eventos: criar futuro, ver confirmados, ver resultados de passados
  return (
    <main className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="font-display font-bold text-2xl text-checkered">Área Administrativa</h1>
      <p className="text-asfalto-600 mt-2">Estrutura base — próxima etapa monta os fluxos.</p>
    </main>
  );
}
