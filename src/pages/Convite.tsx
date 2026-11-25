import { useEffect, useRef } from 'react';
import { Link, Navigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, UsersThree } from '@phosphor-icons/react';
import { ApiError, errorMessage } from '../lib/api';
import { useJoinTrip } from '../lib/queries';
import { Alert, EmptyState } from '../components/ui';

/** Link de convite: /convite/{viagemId}?codigo=XXXX. Quem abre entra na viagem como membro. */
export function Convite() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const tripId = Number(id);
  const code = params.get('codigo')?.trim() ?? '';
  const join = useJoinTrip();
  const sent = useRef(false);

  useEffect(() => {
    if (sent.current || !code || !Number.isFinite(tripId)) return;
    sent.current = true; // StrictMode monta duas vezes: o convite só pode ser usado uma vez.
    join.mutate({ tripId, code });
  }, [code, tripId, join]);

  const alreadyMember = join.error instanceof ApiError && /já é (membro|o criador)/i.test(join.error.message);
  if (join.isSuccess || alreadyMember) return <Navigate to={`/viagens/${tripId}`} replace />;

  return (
    <div className="container page-work" style={{ maxWidth: 640 }}>
      <Link to="/viagens" className="back type-label-md"><ArrowLeft size={20} aria-hidden /> Minhas viagens</Link>
      <h1 className="type-headline-lg page-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Convite para viagem</h1>
      {!code || !Number.isFinite(tripId) ? (
        <Alert kind="error">Este link de convite está incompleto. Peça um novo link para quem criou a viagem.</Alert>
      ) : join.error ? (
        <Alert kind="error">{join.error instanceof ApiError && join.error.status < 500 ? join.error.message : errorMessage(join.error)} Peça um novo link para quem criou a viagem.</Alert>
      ) : (
        <div className="card" role="status"><EmptyState icon={UsersThree} text="Entrando na viagem…" /></div>
      )}
    </div>
  );
}
