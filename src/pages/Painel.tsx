import { useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  AirplaneTilt, CalendarBlank, CaretRight, Globe, MagnifyingGlass, MapPin, MapTrifold, UsersThree, Airplane, type Icon,
} from '@phosphor-icons/react';
import { errorMessage } from '../lib/api';
import { daysUntil, dateRange, money } from '../lib/format';
import { useMe, useTopPlaces, useTrips, useTripDestinations, useVisitedCountries } from '../lib/queries';
import type { Trip } from '../lib/types';
import { Alert, AvatarStack, Button, EmptyState, PillButton, Skeleton, StatusBadge } from '../components/ui';
import { Carousel, PhotoCard, RatingPill, TravelersPill } from '../components/PhotoCard';
import { NovaViagemDialog, type TripDraft } from '../components/NovaViagemDialog';

/** Próxima viagem = a de início futuro mais próximo; sem nenhuma futura, a que está em andamento. */
function pickNextTrip(trips: Trip[]): Trip | undefined {
  const dated = trips.filter((t) => t.startDate && t.status !== 'COMPLETED');
  const future = dated.filter((t) => daysUntil(t.startDate!) >= 0).sort((a, b) => a.startDate!.localeCompare(b.startDate!));
  return future[0];
}

export function Painel() {
  const me = useMe();
  const trips = useTrips();
  const top = useTopPlaces();
  const visited = useVisitedCountries();

  const list = trips.data?.data ?? [];
  const next = useMemo(() => pickNextTrip(list), [list]);
  const nextDestinations = useTripDestinations(next?.id);
  const heroPhoto = nextDestinations.data?.find((d) => d.photoUrl)?.photoUrl ?? top.data?.find((p) => p.photoUrl)?.photoUrl ?? null;

  const [dialog, setDialog] = useState<{ open: boolean; draft?: TripDraft }>({ open: false });
  const openDialog = (draft?: TripDraft) => setDialog({ open: true, draft });

  const firstName = me.data?.name.split(' ')[0];
  const companions = new Set(list.flatMap((t) => t.members.map((m) => m.user.id)).filter((id) => id !== me.data?.id)).size;
  const ongoing = list.filter((t) => t.status !== 'COMPLETED').length;
  const tripsError = trips.error ?? top.error;

  return (
    <>
      <section className="hero" aria-labelledby="hero-title">
        <div className="hero-art">
          <div className="shape" />
          <div className="photo">
            {heroPhoto ? <img src={heroPhoto} alt="" /> : <div className="hero-photo-fallback"><AirplaneTilt size={96} aria-hidden /></div>}
          </div>
          {next && (
            <Link to={`/viagens/${next.id}`} className="floating-card">
              <div className="top">
                <div>
                  <p className="type-label-sm muted">Próxima viagem</p>
                  <p className="type-title-md card-title">{next.name}</p>
                </div>
                <span className="days-pill type-numeric-md" aria-label={`faltam ${daysUntil(next.startDate!)} dias`}>
                  <span>{daysUntil(next.startDate!)}<small>dias</small></span>
                </span>
              </div>
              <div className="top">
                <AvatarStack names={next.members.map((m) => m.user.name)} />
              </div>
            </Link>
          )}
          <Link to="/descobrir" className="map-button" aria-label="Descobrir destinos no mapa">
            <svg viewBox="0 0 112 112" aria-hidden>
              <defs><path id="ring" d="M56,56 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <circle cx="56" cy="56" r="55" className="ring-bg" />
              <text className="type-label-sm" fill="currentColor" style={{ fontSize: 10 }}><textPath href="#ring" startOffset="0">ver destinos · ver destinos · </textPath></text>
            </svg>
            <span className="core"><MapTrifold size={28} aria-hidden /></span>
          </Link>
        </div>

        <div className="container">
          <div className="hero-copy">
            {firstName && <p className="type-label-md muted">Olá, {firstName}</p>}
            <p className="hero-overline type-label-overline">
              Planeje. Divida. Viaje.
              <svg viewBox="0 0 88 24" fill="none" aria-hidden><path d="M2 20 C 20 22, 34 4, 62 8" stroke="currentColor" strokeWidth="2" strokeDasharray="3 5" strokeLinecap="round" /><g transform="translate(60 -2)"><Airplane weight="fill" size={22} /></g></svg>
            </p>
            <h1 id="hero-title" className="hero-title type-display-hero">Sua viagem <em>começa aqui.</em></h1>
            <p className="hero-text type-body-lg">Monte o roteiro, controle o orçamento e divida as despesas com quem vai junto.</p>
            <div className="hero-actions">
              <PillButton onClick={() => openDialog()}>Nova viagem</PillButton>
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <SearchBar onSubmit={(d) => openDialog(d)} />

        {tripsError && (
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <Alert kind="error" action={<Button variant="compact" onClick={() => { void trips.refetch(); void top.refetch(); }}>Tentar de novo</Button>}>
              {errorMessage(tripsError)}
            </Alert>
          </div>
        )}

        <div className="band">
          <div className="band-left">
            <NextTripBanner trip={next} loading={trips.isLoading} onNew={() => openDialog()} />
            <section className="stats-strip" aria-label="Seus números">
              <Stat icon={AirplaneTilt} tone="" value={ongoing} label="viagens" loading={trips.isLoading} />
              <Stat icon={Globe} tone="warm" value={visited.data} label="países visitados" loading={visited.isLoading} />
              <Stat icon={UsersThree} tone="cool" value={companions} label="companheiros" loading={trips.isLoading} />
            </section>
          </div>

          <section aria-labelledby="minhas-viagens">
            <div className="section-row">
              <h2 id="minhas-viagens" className="type-headline-sm card-title">Minhas viagens</h2>
            </div>
            {trips.isLoading ? (
              <div style={{ display: 'flex', gap: 16 }}>{[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 240, width: 200, borderRadius: 'var(--radius-lg)', flex: 'none' }} />)}</div>
            ) : list.length === 0 ? (
              <EmptyState icon={AirplaneTilt} text="Você ainda não tem viagens. Crie a primeira!" action={<Button onClick={() => openDialog()}>Nova viagem</Button>} />
            ) : (
              <Carousel label="Minhas viagens">
                {list.map((t) => (
                  <li key={t.id} style={{ display: 'contents' }}>
                    <TripCard trip={t} />
                  </li>
                ))}
              </Carousel>
            )}
          </section>
        </div>

        <section className="band-full" aria-labelledby="top-destinos">
          <div className="section-row">
            <h2 id="top-destinos" className="type-headline-sm card-title">Destinos mais bem avaliados</h2>
            <Link to="/descobrir" className="type-label-md">Ver todos <CaretRight size={16} aria-hidden /></Link>
          </div>
          {top.isLoading ? (
            <div style={{ display: 'flex', gap: 16 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 260, width: 220, borderRadius: 'var(--radius-lg)', flex: 'none' }} />)}</div>
          ) : !top.data?.length ? (
            <EmptyState icon={MapPin} text="Ainda não há destinos avaliados." />
          ) : (
            <Carousel label="Destinos mais bem avaliados" wide>
              {top.data.map((p) => (
                <li key={p.id} style={{ display: 'contents' }}>
                  <PhotoCard to={`/descobrir?q=${encodeURIComponent(p.name)}`} photoUrl={p.photoUrl} alt={`Foto de ${p.name}`} title={p.name} subtitle={[p.city, p.country].filter(Boolean).join(', ')} corner={<RatingPill value={p.averageRating} />} />
                </li>
              ))}
            </Carousel>
          )}
        </section>
      </div>

      <NovaViagemDialog open={dialog.open} draft={dialog.draft} onClose={() => setDialog({ open: false })} />
    </>
  );
}

function TripCard({ trip }: { trip: Trip }) {
  const dest = useTripDestinations(trip.id);
  const photo = dest.data?.find((d) => d.photoUrl)?.photoUrl ?? null;
  return (
    <PhotoCard
      to={`/viagens/${trip.id}`}
      photoUrl={photo}
      alt={`Foto de ${trip.name}`}
      title={trip.name}
      subtitle={dateRange(trip.startDate, trip.endDate)}
      badge={<StatusBadge status={trip.status} />}
      corner={<TravelersPill count={trip.members.length} />}
    />
  );
}

function NextTripBanner({ trip, loading, onNew }: { trip?: Trip; loading: boolean; onNew: () => void }) {
  if (loading) return <Skeleton style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />;
  if (!trip) {
    return (
      <div className="promo-banner">
        <span className="promo-badge type-label-sm">Comece agora</span>
        <h2 className="type-headline-md">Sua primeira viagem começa com um destino</h2>
        <PillButton onClick={onNew}>Nova viagem</PillButton>
      </div>
    );
  }
  const days = daysUntil(trip.startDate!);
  const free = trip.budgetTotal != null ? trip.budgetTotal - trip.plannedTotal : null;
  return (
    <div className="promo-banner">
      <span className="promo-badge type-label-sm">Próxima viagem</span>
      <h2 className="type-headline-md">{trip.name} <em>{days === 0 ? 'começa hoje' : days === 1 ? 'falta 1 dia' : `faltam ${days} dias`}</em></h2>
      {free != null && <p className="type-body-sm" style={{ color: 'var(--color-neutral)' }}>{free >= 0 ? `${money(free)} ainda livres no orçamento` : `${money(-free)} acima do orçamento`}</p>}
      <Link to={`/viagens/${trip.id}`} className="button-pill button-pill-light type-label-lg">Abrir roteiro <CaretRight size={20} aria-hidden /></Link>
    </div>
  );
}

function Stat({ icon: I, tone, value, label, loading }: { icon: Icon; tone: string; value: number | undefined; label: string; loading: boolean }) {
  return (
    <div className="item">
      <span className={`stat-icon ${tone}`}><I size={24} aria-hidden /></span>
      <div>
        <p className="type-title-md">{loading ? '–' : (value ?? '–')}</p>
        <p className="type-body-sm muted">{label}</p>
      </div>
    </div>
  );
}

/** Busca em pílula: o destino vira o nome da viagem e as datas já vão preenchidas no formulário. */
function SearchBar({ onSubmit }: { onSubmit: (d: TripDraft) => void }) {
  const [where, setWhere] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({ name: where.trim() ? `Viagem para ${where.trim()}` : '', start, end });
  };
  return (
    <form className="search-bar" role="search" aria-label="Começar uma viagem" onSubmit={submit}>
      <label className="search-field">
        <span className="field-icon"><MapPin size={20} aria-hidden /></span>
        <span className="field-text"><span className="type-label-md">Para onde?</span><input className="bare type-body-sm" placeholder="Cidade ou país" value={where} onChange={(e) => setWhere(e.target.value)} /></span>
      </label>
      <label className="search-field">
        <span className="field-icon"><CalendarBlank size={20} aria-hidden /></span>
        <span className="field-text"><span className="type-label-md">Ida</span><input className="bare type-body-sm" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></span>
      </label>
      <label className="search-field" style={{ borderRight: 0 }}>
        <span className="field-icon"><CalendarBlank size={20} aria-hidden /></span>
        <span className="field-text"><span className="type-label-md">Volta</span><input className="bare type-body-sm" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} /></span>
      </label>
      <button type="submit" className="search-button" aria-label="Começar viagem com estes dados">
        <MagnifyingGlass size={24} aria-hidden /><span className="label type-label-lg">Buscar</span>
      </button>
    </form>
  );
}
