import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AirplaneTilt, CalendarBlank, CaretRight, Globe, ArrowRight, MapPin, MapTrifold, UsersThree, type Icon,
} from '@phosphor-icons/react';
import { errorMessage } from '../lib/api';
import { daysUntil, money } from '../lib/format';
import { useMe, usePlaces, useTopActivities, useTopPlaces, useTrips, useTripDestinations } from '../lib/queries';
import { useAuth } from '../lib/auth';
import { useTravelHistory } from '../lib/travelHistory';
import { TripCard } from '../components/TripCard';
import { CatalogActivityCard } from '../components/CatalogActivityCard';
import { CategoryBadge } from '../components/CategoryBadge';
import type { Place, Trip } from '../lib/types';
import { matchPlace, placeLabel } from '../lib/places';
import { Alert, AvatarStack, Button, EmptyState, Skeleton } from '../components/ui';
import { Carousel, PhotoCard, RatingPill } from '../components/PhotoCard';
import { NovaViagemDialog, type TripDraft } from '../components/NovaViagemDialog';
import { FadeImg } from '../components/FadeImg';
import { HeroPlane } from '../components/HeroPlane';

/** Próxima viagem = a de início futuro mais próximo; sem nenhuma futura, a que está em andamento. */
function pickNextTrip(trips: Trip[]): Trip | undefined {
  const dated = trips.filter((t) => t.startDate && t.status !== 'COMPLETED');
  const future = dated.filter((t) => daysUntil(t.startDate!) >= 0).sort((a, b) => a.startDate!.localeCompare(b.startDate!));
  return future[0];
}

export function Painel() {
  const { status } = useAuth();
  const authed = status === 'authed';
  const navigate = useNavigate();
  const places = usePlaces('');
  const me = useMe();
  const trips = useTrips();
  const top = useTopPlaces();
  const topActivities = useTopActivities();
  const history = useTravelHistory();

  const list = trips.data?.data ?? [];
  const next = useMemo(() => pickNextTrip(list), [list]);
  const nextDestinations = useTripDestinations(next?.id);
  const heroPhoto = nextDestinations.data?.find((d) => d.photoUrl)?.photoUrl ?? top.data?.find((p) => p.photoUrl)?.photoUrl ?? null;

  const [dialog, setDialog] = useState<{ open: boolean; draft?: TripDraft }>({ open: false });
  // Sem login, criar viagem leva ao login e volta para cá.
  const openDialog = (draft?: TripDraft) => (authed ? setDialog({ open: true, draft }) : navigate('/entrar', { state: { from: '/' } }));

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
            {heroPhoto ? <FadeImg width={1600} src={heroPhoto} alt="" /> : <div className="hero-photo-fallback"><AirplaneTilt size={96} aria-hidden /></div>}
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
                <AvatarStack people={next.members.map((m) => m.user)} />
              </div>
            </Link>
          )}
          {authed && <Link to="/viagens#mapa" className="map-button" aria-label="Ver meu mapa de viagens">
            <svg viewBox="0 0 112 112" aria-hidden>
              <defs><path id="ring" d="M56,56 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" /></defs>
              <circle cx="56" cy="56" r="55" className="ring-bg" />
              <text className="type-label-sm" fill="currentColor" style={{ fontSize: 10 }}><textPath href="#ring" startOffset="0">ver no mapa · ver no mapa · </textPath></text>
            </svg>
            <span className="core"><MapTrifold size={28} aria-hidden /></span>
          </Link>}
        </div>

        <div className="container">
          <div className="hero-copy">
            {firstName && <p className="type-label-md muted">Olá, {firstName}</p>}
            <p className="hero-overline type-label-overline">
              Planeje. Divida. Viaje.
              <HeroPlane />
            </p>
            <h1 id="hero-title" className="hero-title type-display-hero">Sua viagem <em>começa aqui.</em></h1>
            <p className="hero-text type-body-lg">Monte o roteiro, controle o orçamento e divida as despesas com quem vai junto.</p>
          </div>
        </div>
      </section>

      <div className="container">
        <SearchBar places={places.data?.data ?? []} onSubmit={(d) => openDialog(d)} />

        {tripsError && (
          <div style={{ marginTop: 'var(--spacing-xl)' }}>
            <Alert kind="error" action={<Button variant="compact" onClick={() => { void trips.refetch(); void top.refetch(); }}>Tentar de novo</Button>}>
              {errorMessage(tripsError)}
            </Alert>
          </div>
        )}

        {!authed ? (
          <div className="promo-banner band" style={{ display: 'grid', gridTemplateColumns: '1fr' }}>
            <span className="promo-badge type-label-sm">Viagens em grupo</span>
            <h2 className="type-headline-md">Monte o roteiro junto, <em>sem planilha</em></h2>
            <p className="type-body-md" style={{ maxWidth: '52ch', color: 'var(--color-neutral)' }}>
              Entre com sua conta Google para criar viagens, convidar o grupo, controlar o orçamento e pintar seu mapa de viagens.
            </p>
            <Link to="/entrar" state={{ from: '/' }} className="button-pill button-pill-light type-label-lg">Entrar com Google <CaretRight size={20} aria-hidden /></Link>
          </div>
        ) : (
        <div className="band">
          <div className="band-left">
            <NextTripBanner trip={next} loading={trips.isLoading} />
            <section className="stats-strip" aria-label="Seus números">
              <Stat icon={AirplaneTilt} tone="" value={ongoing} label="viagens" loading={trips.isLoading} />
              <Stat icon={Globe} tone="warm" value={history.visitedCountries.size} label="países visitados" loading={history.loading} />
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
              <EmptyState icon={AirplaneTilt} text="Você ainda não tem viagens. Diga para onde quer ir na barra acima e crie a primeira!" />
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
        )}

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
                  <PhotoCard to={`/destinos/${p.id}`} photoUrl={p.photoUrl} alt={`Foto de ${p.name}`} title={p.name} subtitle={[p.city, p.country].filter(Boolean).join(', ')} badge={<CategoryBadge category={p.category} />} corner={<RatingPill value={p.averageRating} />} />
                </li>
              ))}
            </Carousel>
          )}
        </section>

        <section className="band-full" aria-labelledby="top-atividades">
          <div className="section-row">
            <h2 id="top-atividades" className="type-headline-sm card-title">Atividades mais bem avaliadas</h2>
            <Link to="/descobrir?aba=atividades" className="type-label-md">Ver todas <CaretRight size={16} aria-hidden /></Link>
          </div>
          {topActivities.isLoading ? (
            <div style={{ display: 'flex', gap: 16 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} style={{ height: 260, width: 220, borderRadius: 'var(--radius-lg)', flex: 'none' }} />)}</div>
          ) : topActivities.error ? (
            <Alert kind="error">{errorMessage(topActivities.error)}</Alert>
          ) : !topActivities.data?.length ? (
            <EmptyState icon={MapPin} text="Ainda não há atividades avaliadas." />
          ) : (
            <Carousel label="Atividades mais bem avaliadas" wide>
              {topActivities.data.map((a) => (
                <li key={a.id} style={{ display: 'contents' }}>
                  <CatalogActivityCard a={a} />
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

function NextTripBanner({ trip, loading }: { trip?: Trip; loading: boolean }) {
  if (loading) return <Skeleton style={{ height: 200, borderRadius: 'var(--radius-xl)' }} />;
  if (!trip) {
    return (
      <div className="promo-banner">
        <span className="promo-badge type-label-sm">Comece agora</span>
        <h2 className="type-headline-md">Sua primeira viagem começa com um destino</h2>
        <Link to="/descobrir" className="button-pill button-pill-light type-label-lg">Explorar destinos <CaretRight size={20} aria-hidden /></Link>
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

/** Único ponto de criar viagem do painel: o destino vira o nome da viagem e as datas vão preenchidas no formulário. */
function SearchBar({ places, onSubmit }: { places: Place[]; onSubmit: (d: TripDraft) => void }) {
  const [where, setWhere] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const place = matchPlace(places, where);
    const name = place ? place.name : where.trim();
    onSubmit({ name: name ? `Viagem para ${name}` : '', start, end, place: place ?? undefined });
  };
  return (
    <form className="search-bar" aria-labelledby="criar-viagem-chip" onSubmit={submit}>
      <span id="criar-viagem-chip" className="search-chip type-label-sm"><AirplaneTilt size={14} weight="fill" aria-hidden /> Criar viagem</span>
      <label className="search-field">
        <span className="field-icon"><MapPin size={20} aria-hidden /></span>
        <span className="field-text">
          <span className="type-label-md">Para onde?</span>
          {/* Sugestões do catálogo: escolher uma já coloca o destino no roteiro da viagem nova. */}
          <input className="bare type-body-sm" placeholder="Cidade ou país" list="destinos-catalogo" autoComplete="off" value={where} onChange={(e) => setWhere(e.target.value)} />
          <datalist id="destinos-catalogo">
            {places.map((p) => <option key={p.id} value={placeLabel(p)} />)}
          </datalist>
        </span>
      </label>
      <label className="search-field">
        <span className="field-icon"><CalendarBlank size={20} aria-hidden /></span>
        <span className="field-text"><span className="type-label-md">Ida</span><input className="bare type-body-sm" type="date" value={start} onChange={(e) => setStart(e.target.value)} /></span>
      </label>
      <label className="search-field" style={{ borderRight: 0 }}>
        <span className="field-icon"><CalendarBlank size={20} aria-hidden /></span>
        <span className="field-text"><span className="type-label-md">Volta</span><input className="bare type-body-sm" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} /></span>
      </label>
      <button type="submit" className="search-button" aria-label="Criar viagem com estes dados">
        <ArrowRight size={24} aria-hidden /><span className="label type-label-lg">Criar viagem</span>
      </button>
    </form>
  );
}
