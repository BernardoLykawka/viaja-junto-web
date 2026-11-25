import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bed, Compass, MapPin, Star } from '@phosphor-icons/react';
import { isLodging } from '../lib/activityTypes';
import { ApiError, errorMessage } from '../lib/api';
import { rating } from '../lib/format';
import { useCatalogActivities, useCreateReview, useMe, usePlace, usePlaceReviews } from '../lib/queries';
import type { CatalogActivity } from '../lib/types';
import { Alert, EmptyState, Skeleton } from '../components/ui';
import { CatalogActivityCard } from '../components/CatalogActivityCard';
import { ReviewForm, ReviewList } from '../components/Reviews';
import { LoginToAct } from '../components/LoginToAct';
import type { Icon } from '@phosphor-icons/react';

export function Destino() {
  const placeId = Number(useParams().id);
  const place = usePlace(placeId);
  const reviews = usePlaceReviews(placeId);
  const createReview = useCreateReview(placeId);
  const me = useMe();
  // Atividades ficam ligadas à cidade; "Bariloche" no catálogo de destinos tem cidade "San Carlos de Bariloche".
  const byCity = useCatalogActivities(place.data?.city);
  const byName = useCatalogActivities(place.data && place.data.name !== place.data.city ? place.data.name : null);

  if (place.isLoading) return <div className="container page-work"><Skeleton style={{ height: 320, borderRadius: 'var(--radius-xl)' }} /></div>;
  if (place.error || !place.data) {
    return (
      <div className="container page-work">
        <Link to="/descobrir" className="back type-label-md"><ArrowLeft size={20} aria-hidden /> Descobrir</Link>
        <Alert kind="error">{place.error instanceof ApiError && place.error.status === 404 ? 'Destino não encontrado.' : errorMessage(place.error)}</Alert>
      </div>
    );
  }

  const p = place.data;
  const all = [...(byCity.data ?? []), ...(byName.data ?? [])].filter((a, i, arr) => arr.findIndex((x) => x.id === a.id) === i);
  const loadingActivities = byCity.isLoading || byName.isLoading;
  const todo = all.filter((a) => !isLodging(a.type));
  const stays = all.filter((a) => isLodging(a.type));
  const myReview = reviews.data?.data.find((r) => r.author.id === me.data?.id);

  return (
    <div className="container page-work">
      <Link to="/descobrir" className="back type-label-md"><ArrowLeft size={20} aria-hidden /> Descobrir</Link>

      <header className="place-hero">
        {p.photoUrl ? <img src={p.photoUrl} alt={`Foto de ${p.name}`} /> : <span className="photo-fallback"><MapPin size={64} aria-hidden /></span>}
        <div className="place-hero-caption">
          <p className="type-label-sm">{[p.city !== p.name ? p.city : null, p.country].filter(Boolean).join(' · ')}</p>
          <h1 className="type-display">{p.name}</h1>
          <p className="type-label-md place-rating">
            <Star weight="fill" size={20} aria-hidden /> {rating(p.averageRating)} · {p.reviewCount === 1 ? '1 avaliação' : `${p.reviewCount} avaliações`}
          </p>
        </div>
      </header>

      {p.description && <p className="type-body-lg" style={{ marginTop: 'var(--spacing-lg)', maxWidth: '70ch' }}>{p.description}</p>}

      <ActivityGrid id="o-que-fazer" title="O que fazer" icon={Compass} items={todo} placeId={p.id} loading={loadingActivities}
        empty={`Ainda não há passeios cadastrados em ${p.name}.`} error={byCity.error ?? byName.error} />
      <ActivityGrid id="onde-ficar" title="Onde ficar" icon={Bed} items={stays} placeId={p.id} loading={loadingActivities}
        empty={`Ainda não há hospedagens cadastradas em ${p.name}.`} />

      <div className="two-col" style={{ marginTop: 'var(--spacing-2xl)' }}>
        <section className="card" aria-labelledby="aval-h">
          <h2 id="aval-h" className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Avaliações de {p.name}</h2>
          <ReviewList query={reviews} emptyText="Ninguém avaliou este destino ainda. Seja a primeira pessoa!" />
        </section>
        <LoginToAct text="Entre para avaliar este destino e montar viagens com ele."><ReviewForm create={createReview} what="este destino" myRating={myReview?.rating} /></LoginToAct>
      </div>
    </div>
  );
}

function ActivityGrid({ id, title, icon: I, items, placeId, loading, empty, error }: { id: string; title: string; icon: Icon; items: CatalogActivity[]; placeId: number; loading: boolean; empty: string; error?: unknown }) {
  return (
    <section aria-labelledby={id} style={{ marginTop: 'var(--spacing-2xl)' }}>
      <div className="section-row">
        <h2 id={id} className="type-headline-sm card-title" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-sm)' }}>
          <I size={24} aria-hidden style={{ color: 'var(--color-primary)' }} /> {title}
        </h2>
      </div>
      {error ? <Alert kind="error">{errorMessage(error)}</Alert> : loading ? (
        <div className="grid-cards">{[0, 1, 2].map((i) => <Skeleton key={i} style={{ height: 260, borderRadius: 'var(--radius-lg)' }} />)}</div>
      ) : items.length === 0 ? (
        <div className="card"><EmptyState icon={I} text={empty} /></div>
      ) : (
        <ul className="grid-cards">{items.map((a) => <li key={a.id}><CatalogActivityCard placeId={placeId} a={a} /></li>)}</ul>
      )}
    </section>
  );
}
