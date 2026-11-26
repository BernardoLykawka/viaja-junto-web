import { CloudSun } from '@phosphor-icons/react';
import { errorMessage } from '../lib/api';
import { dateRange } from '../lib/format';
import { useTripDestinations } from '../lib/queries';
import type { Trip } from '../lib/types';
import { Alert, EmptyState, Skeleton } from './ui';
import { TravelInfoCard } from './TravelInfo';

/** Aba "Clima e câmbio" da viagem: para cada destino, o tempo nas datas dele e o conversor de moeda. */
export function ClimaTab({ trip }: { trip: Trip }) {
  const { data, isLoading, error } = useTripDestinations(trip.id);
  if (isLoading) return <Skeleton style={{ height: 240 }} />;
  if (error) return <Alert kind="error">{errorMessage(error)}</Alert>;
  const stops = [...(data ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.arrivalDate ?? '').localeCompare(b.arrivalDate ?? ''));
  return (
    <section aria-labelledby="clima-h" className="stack">
      <h2 id="clima-h" className="type-headline-sm card-title">Clima e câmbio</h2>
      {stops.length === 0 ? (
        <div className="card"><EmptyState icon={CloudSun} text="Adicione destinos ao roteiro para ver o clima e a moeda de cada um." /></div>
      ) : (
        stops.map((s) => (
          <TravelInfoCard
            key={s.id}
            title={`${s.name}${s.country ? `, ${s.country}` : ''} · ${dateRange(s.arrivalDate ?? trip.startDate, s.departureDate ?? trip.endDate)}`}
            city={s.name}
            countryA3={s.isoCode}
            countryName={s.country}
            start={s.arrivalDate ?? trip.startDate}
            end={s.departureDate ?? trip.endDate}
          />
        ))
      )}
      <p className="type-body-sm muted">Clima: Open-Meteo. Câmbio: ExchangeRate-API. Valores só para referência.</p>
    </section>
  );
}
