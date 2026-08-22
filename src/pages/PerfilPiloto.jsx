import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Loader2, User, Instagram, Share2, Pencil, ArrowLeft, Clock } from 'lucide-react';
import EstatisticasPiloto from '../components/perfil/EstatisticasPiloto.jsx';
import EditarPerfilModal from '../components/perfil/EditarPerfilModal.jsx';
import CartaoCompartilhar from '../components/perfil/CartaoCompartilhar.jsx';

export default function PerfilPiloto() {
  const { id } = useParams();
  const [piloto, setPiloto] = useState(null);
  const [erro, setErro] = useState(null);
  const [modalEdicao, setModalEdicao] = useState(false);
  const [modalCompartilhar, setModalCompartilhar] = useState(false);

  useEffect(() => {
    carregar();
  }, [id]);

  async function carregar() {
    setErro(null);
    setPiloto(null);
    try {
      const resp = await fetch(`/api/pilotos/${id}`);
      if (!resp.ok) throw new Error('Piloto não encontrado');
      setPiloto(await resp.json());
    } catch (e) {
      setErro(e.message);
    }
  }

  if (erro) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center">
        <p className="text-checkered">{erro}</p>
        <Link to="/" className="text-racing hover:text-racing-light text-sm mt-3 inline-block">
          Voltar pra Home
        </Link>
      </main>
    );
  }

  if (!piloto) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-racing" />
      </div>
    );
  }

  return (
    <main className="max-w-xl mx-auto px-4 py-10 space-y-8">
      <Link to="/" className="flex items-center gap-1.5 text-sm text-asfalto-600 hover:text-checkered w-fit">
        <ArrowLeft className="w-4 h-4" /> Voltar
      </Link>

      {piloto.status !== 'aprovado' && (
        <div className="bg-asfalto-800 border border-asfalto-700 rounded-lg px-4 py-2.5 text-sm text-asfalto-600 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          {piloto.status === 'pendente'
            ? 'Perfil aguardando aprovação — só você consegue ver essa página por enquanto.'
            : 'Este perfil não foi aprovado.'}
        </div>
      )}

      {piloto.oculto && (
        <div className="bg-asfalto-800 border border-asfalto-700 rounded-lg px-4 py-2.5 text-sm text-asfalto-600 flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          Este perfil está oculto do ranking e das listas públicas.
        </div>
      )}

      {/* Cabeçalho */}
      <div className="flex flex-col items-center text-center gap-3">
        {piloto.foto_url ? (
          <img src={piloto.foto_url} alt={piloto.nome} className="w-24 h-24 rounded-full object-cover border-4 border-racing" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-asfalto-800 border-4 border-racing flex items-center justify-center">
            <User className="w-10 h-10 text-asfalto-600" />
          </div>
        )}
        <h1 className="font-display font-bold text-2xl text-checkered">{piloto.nome}</h1>
        {piloto.instagram && (
          <span className="flex items-center gap-1 text-sm text-asfalto-600">
            <Instagram className="w-4 h-4" /> {piloto.instagram}
          </span>
        )}

        <div className="flex gap-2 mt-1">
          <button
            onClick={() => setModalCompartilhar(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-racing hover:bg-racing-dark text-checkered text-sm font-medium"
          >
            <Share2 className="w-4 h-4" /> Compartilhar
          </button>
          <button
            onClick={() => setModalEdicao(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-asfalto-600 text-checkered text-sm hover:bg-asfalto-800"
          >
            <Pencil className="w-4 h-4" /> Editar
          </button>
        </div>
      </div>

      <EstatisticasPiloto dados={piloto} />

      {modalEdicao && (
        <EditarPerfilModal
          piloto={piloto}
          onFechar={() => setModalEdicao(false)}
          onSalvo={(atualizado) => {
            setPiloto((p) => ({ ...p, ...atualizado }));
            setModalEdicao(false);
          }}
        />
      )}

      {modalCompartilhar && (
        <CartaoCompartilhar piloto={piloto} onFechar={() => setModalCompartilhar(false)} />
      )}
    </main>
  );
}
