import { lazy, Suspense } from 'react';
import type { TravelHistory } from '../lib/travelHistory';
import { Skeleton } from './ui';

// O mapa (d3-geo + world-atlas) pesa ~50 kB: só carrega quando a seção aparece.
const WorldMap = lazy(() => import('./WorldMap'));

/** "Seu mapa de viagens": usado no painel e no perfil. */
export function TravelMapSection({ history, id = 'mapa', className = '' }: { history: TravelHistory; id?: string; className?: string }) {
  const placeholder = <Skeleton style={{ aspectRatio: '96 / 50', width: '100%' }} />;
  return (
    <section id={id} className={`card ${className}`} aria-labelledby={`${id}-h`} style={{ scrollMarginTop: 'var(--spacing-5xl)' }}>
      <div className="section-row">
        <h2 id={`${id}-h`} className="type-headline-sm card-title">Seu mapa de viagens</h2>
      </div>
      <Suspense fallback={placeholder}>
        {history.loading ? placeholder : <WorldMap visited={history.visitedCountries} planned={history.plannedCountries} />}
      </Suspense>
    </section>
  );
}
