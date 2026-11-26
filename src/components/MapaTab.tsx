import { lazy, Suspense } from 'react';
import { MapPin, MapTrifold } from '@phosphor-icons/react';
import { errorMessage } from '../lib/api';
import { useTripMap } from '../lib/queries';
import type { Trip } from '../lib/types';
import { Alert, EmptyState, Skeleton } from './ui';

// Leaflet só é baixado quando a aba Mapa é aberta.
const TripMap = lazy(() => import('./TripMap'));

export function MapaTab({ trip }: { trip: Trip }) {
  const { data, isLoading, error } = useTripMap(trip.id);
  const destinations = data?.filter((m) => m.type === 'destination') ?? [];
  const activities = data?.filter((m) => m.type === 'activity') ?? [];
  const placeholder = <Skeleton style={{ height: 420, borderRadius: 'var(--radius-lg)' }} />;

  return (
    <section aria-labelledby="mapa-viagem-h" className="stack">
      <h2 id="mapa-viagem-h" className="type-headline-sm card-title">Mapa da viagem</h2>
      {error && <Alert kind="error">{errorMessage(error, 'ver o mapa desta viagem')}</Alert>}
      {isLoading ? placeholder : data && data.length === 0 ? (
        <div className="card">
          <EmptyState icon={MapTrifold} text="Ainda não há nada para mostrar no mapa. Adicione destinos e atividades ao roteiro; se mesmo assim ficar vazio, o servidor pode estar sem a chave do Google Places." />
        </div>
      ) : data && (
        <div className="two-col">
          <div className="card" style={{ padding: 'var(--spacing-sm)' }}>
            <Suspense fallback={placeholder}>
              <TripMap markers={data} label={`Mapa de ${trip.name} com ${destinations.length} destinos e ${activities.length} atividades.`} />
            </Suspense>
          </div>
          <div className="card stack-sm">
            <p className="world-map-legend type-body-sm">
              <span><i className="swatch dest" aria-hidden /> Destino</span>
              <span><i className="swatch act" aria-hidden /> Atividade</span>
            </p>
            <ul className="list">
              {data.map((m) => (
                <li key={`${m.type}-${m.id}`}>
                  <span className={`cat-icon ${m.type === 'activity' ? '' : 'dest'}`}>{m.type === 'destination' ? <MapTrifold size={20} aria-hidden /> : <MapPin size={20} aria-hidden />}</span>
                  <div className="grow">
                    <p className="type-title-md">{m.label}</p>
                    <p className="type-body-sm muted">{m.type === 'destination' ? 'Destino' : 'Atividade'}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
