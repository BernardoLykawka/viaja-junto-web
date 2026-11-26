import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { AirplaneTilt, Plus, Ticket } from '@phosphor-icons/react';
import { errorMessage } from '../lib/api';
import { useTrips } from '../lib/queries';
import { useTravelHistory } from '../lib/travelHistory';
import type { TripStatus } from '../lib/types';
import { Alert, Button, EmptyState, Skeleton, STATUS_META } from '../components/ui';
import { TripCard } from '../components/TripCard';
import { TravelMapSection } from '../components/TravelMapSection';
import { NovaViagemDialog } from '../components/NovaViagemDialog';
import { EntrarComCodigoDialog } from '../components/EntrarComCodigoDialog';

type Filter = 'ALL' | TripStatus;
const FILTERS: Filter[] = ['ALL', 'PLANNING', 'CONFIRMED', 'COMPLETED'];
const label = (f: Filter) => (f === 'ALL' ? 'Todas' : STATUS_META[f].label);

/** Todas as viagens do usuário, com filtro por situação, e o mapa dos países já visitados. */
export function MinhasViagens() {
  const trips = useTrips();
  const history = useTravelHistory();
  const { hash } = useLocation();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [creating, setCreating] = useState(false);
  const [joining, setJoining] = useState(false);

  const all = trips.data?.data ?? [];
  // Próximas primeiro; sem data vão para o fim.
  const sorted = [...all].sort((a, b) => (a.startDate ?? '9999').localeCompare(b.startDate ?? '9999'));
  const shown = filter === 'ALL' ? sorted : sorted.filter((t) => t.status === filter);

  // "ver no mapa" do Início chega aqui com #mapa.
  useEffect(() => {
    if (hash === '#mapa' && !history.loading) document.getElementById('mapa')?.scrollIntoView({ behavior: 'smooth' });
  }, [hash, history.loading]);

  return (
    <div className="container page-work stack">
      <div className="section-head" style={{ marginBottom: 0 }}>
        <h1 className="type-headline-lg page-title">Minhas viagens</h1>
        <div style={{ display: 'flex', gap: 'var(--spacing-sm-plus)', flexWrap: 'wrap' }}>
          <Button variant="secondary" icon={Ticket} onClick={() => setJoining(true)}>Entrar com código</Button>
          <Button icon={Plus} onClick={() => setCreating(true)}>Nova viagem</Button>
        </div>
      </div>

      {all.length > 0 && (
        <div className="chips" role="group" aria-label="Filtrar por situação">
          {FILTERS.map((f) => {
            const count = f === 'ALL' ? all.length : all.filter((t) => t.status === f).length;
            return (
              <button key={f} type="button" className="chip type-label-md" aria-pressed={filter === f} onClick={() => setFilter(f)}>
                {label(f)} <span className="muted">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {trips.error && <Alert kind="error" action={<Button variant="compact" onClick={() => void trips.refetch()}>Tentar de novo</Button>}>{errorMessage(trips.error)}</Alert>}

      {trips.isLoading ? (
        <div className="grid-cards">{[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />)}</div>
      ) : all.length === 0 ? (
        <div className="card"><EmptyState icon={AirplaneTilt} text="Você ainda não tem viagens. Crie a primeira e chame o grupo!" /></div>
      ) : shown.length === 0 ? (
        <p className="type-body-md muted">Nenhuma viagem com a situação “{label(filter)}”.</p>
      ) : (
        <ul className="grid-cards">{shown.map((t) => <li key={t.id}><TripCard trip={t} /></li>)}</ul>
      )}

      <TravelMapSection history={history} />

      <NovaViagemDialog open={creating} onClose={() => setCreating(false)} />
      <EntrarComCodigoDialog open={joining} onClose={() => setJoining(false)} />
    </div>
  );
}
