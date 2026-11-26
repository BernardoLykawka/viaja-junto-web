import { Link } from 'react-router-dom';
import { FlagCheckered } from '@phosphor-icons/react';
import type { ReactNode } from 'react';

/**
 * Só quem já foi avalia: a pessoa precisa ter concluído (situação "Concluída") uma viagem com este destino
 * ou esta atividade no roteiro. Quem já avaliou continua vendo a própria nota.
 */
export function ReviewGate({ allowed, loading, what, children }: { allowed: boolean; loading: boolean; what: string; children: ReactNode }) {
  if (loading) return null;
  if (allowed) return <>{children}</>;
  return (
    <section className="card stack-sm">
      <h2 className="type-headline-sm card-title inline-link"><FlagCheckered size={24} aria-hidden /> Avaliar {what}</h2>
      <p className="type-body-md">
        Você poderá avaliar {what} depois de concluir uma viagem com {what === 'este destino' ? 'ele' : 'ela'} no roteiro.
      </p>
      <Link to="/viagens" className="type-label-md">Ir para minhas viagens</Link>
    </section>
  );
}
