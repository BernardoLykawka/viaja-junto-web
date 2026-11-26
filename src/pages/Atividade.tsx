import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Star } from '@phosphor-icons/react';
import { categoryIcon, isLodging, normalizeType, sameCity } from '../lib/activityTypes';
import { ApiError, errorMessage } from '../lib/api';
import { price, rating } from '../lib/format';
import { useActivityReviewsPaged, useCatalogActivity, useCreateActivityReview, useMe, usePlaces } from '../lib/queries';
import { Alert, Button, Skeleton } from '../components/ui';
import { ReviewForm, ReviewList } from '../components/Reviews';
import { AddToTripDialog } from '../components/AddToTripDialog';
import { LoginToAct } from '../components/LoginToAct';
import { ReviewGate } from '../components/ReviewGate';
import { useTravelHistory } from '../lib/travelHistory';
import { useAuth } from '../lib/auth';

/** Atividade do catálogo dentro de um destino: um passeio (Cristo Redentor) ou uma hospedagem (hotel). */
export function Atividade() {
  const { id, activityId } = useParams();
  const actId = Number(activityId);
  const activity = useCatalogActivity(actId);
  const places = usePlaces('');
  // A atividade pertence a uma cidade; o destino do catálogo vem do caminho ou é achado pela cidade.
  const place = id
    ? places.data?.data.find((p) => p.id === Number(id))
    : places.data?.data.find((p) => sameCity(p.city, activity.data?.city) || sameCity(p.name, activity.data?.city));
  const placeId = place?.id ?? 0; // a API não usa o destino do caminho nas avaliações de atividade
  const reviews = useActivityReviewsPaged(placeId, actId);
  const createReview = useCreateActivityReview(placeId, actId);
  const me = useMe();
  const history = useTravelHistory();
  const [adding, setAdding] = useState(false);
  const { status } = useAuth();

  const back = place
    ? <Link to={`/destinos/${place.id}`} className="back type-label-md"><ArrowLeft size={20} aria-hidden /> {place.name}</Link>
    : <Link to="/descobrir?aba=atividades" className="back type-label-md"><ArrowLeft size={20} aria-hidden /> Descobrir</Link>;

  if (activity.isLoading) return <div className="container page-work">{back}<Skeleton style={{ height: 320, borderRadius: 'var(--radius-xl)' }} /></div>;
  if (activity.error || !activity.data) {
    return (
      <div className="container page-work">
        {back}
        <Alert kind="error">{activity.error instanceof ApiError && activity.error.status === 404 ? 'Atividade não encontrada.' : errorMessage(activity.error)}</Alert>
      </div>
    );
  }

  const a = activity.data;
  const lodging = isLodging(a.type);
  const I = categoryIcon(a.type);
  const myReview = reviews.items.find((r) => r.author.id === me.data?.id);

  return (
    <div className="container page-work">
      {back}
      <header className="place-hero">
        {a.photoUrl ? <img src={a.photoUrl} alt={`Foto de ${a.name}`} /> : <span className="photo-fallback"><MapPin size={64} aria-hidden /></span>}
        <div className="place-hero-caption">
          <p className="type-label-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--spacing-xs)' }}>
            <I size={16} weight="fill" aria-hidden /> {normalizeType(a.type) ?? a.type} · {[a.location, a.city].filter(Boolean).join(', ')}
          </p>
          <h1 className="type-display">{a.name}</h1>
          <p className="type-label-md place-rating">
            <Star weight="fill" size={20} aria-hidden /> {rating(a.averageRating)} · {a.reviewCount === 1 ? '1 avaliação' : `${a.reviewCount} avaliações`}
          </p>
        </div>
      </header>

      <div className="two-col" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="stack">
          {a.description && (
            <section className="card">
              <h2 className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-sm)' }}>{lodging ? 'Sobre a hospedagem' : 'Sobre'}</h2>
              <p className="type-body-md">{a.description}</p>
            </section>
          )}
          <section className="card" aria-labelledby="av-ativ">
            <h2 id="av-ativ" className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Avaliações</h2>
            <ReviewList query={reviews} emptyText={lodging ? 'Ninguém avaliou esta hospedagem ainda.' : 'Ninguém avaliou esta atividade ainda.'} />
          </section>
        </div>

        <div className="stack">
          <section className="card stack-sm">
            <span className="type-label-sm muted">{lodging ? 'Preço médio por noite' : 'Preço médio'}</span>
            <span className="type-numeric-lg">{price(a.averagePrice) ?? 'Sem preço'}</span>
            {place && status === 'authed' && (
              <Button icon={Plus} onClick={() => setAdding(true)} style={{ marginTop: 'var(--spacing-sm)' }}>
                {lodging ? 'Reservar na viagem' : 'Adicionar à viagem'}
              </Button>
            )}
          </section>
          <LoginToAct text={lodging ? 'Entre para colocar esta hospedagem numa viagem ou avaliá-la.' : 'Entre para colocar esta atividade numa viagem ou avaliá-la.'}>
            <ReviewGate allowed={!!myReview || history.visitedActivityIds.has(a.id)} loading={history.loading} what={lodging ? 'esta hospedagem' : 'esta atividade'}>
              <ReviewForm create={createReview} what={lodging ? 'esta hospedagem' : 'esta atividade'} myRating={myReview?.rating} />
            </ReviewGate>
          </LoginToAct>
        </div>
      </div>

      {place && <AddToTripDialog open={adding} onClose={() => setAdding(false)} place={place} activity={a} />}
    </div>
  );
}
