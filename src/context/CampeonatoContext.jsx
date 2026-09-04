import { createContext, useContext, useMemo } from 'react';
import { useParams } from 'react-router-dom';

const CampeonatoContext = createContext(null);

// Envolve as rotas /c/:slug/* — lê o slug da URL e disponibiliza pra qualquer
// componente descendente via useCampeonato(), sem precisar passar como prop
// manualmente por toda a árvore.
export function CampeonatoProvider({ children }) {
  const { slug } = useParams();

  // useMemo garante que apiUrl/rota mantêm a mesma referência entre renders
  // (enquanto o slug não mudar) — importante porque useEffect([apiUrl]) em
  // componentes filhos dispararia de novo a cada render se essas funções
  // fossem recriadas toda vez.
  const valor = useMemo(
    () => ({
      slug,
      apiUrl: (caminho) => `/api/c/${slug}${caminho.startsWith('/') ? caminho : `/${caminho}`}`,
      rota: (caminho) => `/c/${slug}${caminho.startsWith('/') ? caminho : `/${caminho}`}`
    }),
    [slug]
  );

  return <CampeonatoContext.Provider value={valor}>{children}</CampeonatoContext.Provider>;
}

export function useCampeonato() {
  const contexto = useContext(CampeonatoContext);
  if (!contexto) {
    throw new Error('useCampeonato precisa ser usado dentro de um <CampeonatoProvider>');
  }
  return contexto;
}
