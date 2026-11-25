import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, MapPin, Plus, Star } from '@phosphor-icons/react';
import { categoryIcon, isLodging, normalizeType } from '../lib/activityTypes';
import { ApiError, errorMessage } from '../lib/api';
import { money, rating } from '../lib/format';
import { useActivityReviews, useCatalogActivity, useCreateActivityReview, useMe, usePlace } from '../lib/queries';
import { Alert, Button, Skeleton } from '../components/ui';
import { ReviewForm, ReviewList } from '../components/Reviews';
import { AddToTripDialog } from '../components/AddToTripDialog';
import { LoginToAct } from '../components/LoginToAct';
import { useAuth } from '../lib/auth';

/** Atividade do catálogo dentro de um destino: um passeio (Cristo Redentor) ou uma hospedagem (hotel). */
export function Atividade() {
  const { id, activityId } = useParams();
  const placeId = Number(id);
  const actId = Number(activityId);
  const place = usePlace(placeId);
  const activity = useCatalogActivity(actId);
  const reviews = useActivityReviews(placeId, actId);
  const createReview = useCreateActivityReview(placeId, actId);
  const me = useMe();
  const [adding, setAdding] = useState(false);
  const { status } = useAuth();

  const back = <Link to={`/destinos/${placeId}`} className="back type-label-md"><ArrowLeft size={20} aria-hidden /> {place.data?.name ?? 'Destino'}</Link>;

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
  const myReview = reviews.data?.data.find((r) => r.author.id === me.data?.id);

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
            <span className="type-numeric-lg">{a.averagePrice != null ? money(a.averagePrice) : 'Sem preço'}</span>
            {place.data && status === 'authed' && (
              <Button icon={Plus} onClick={() => setAdding(true)} style={{ marginTop: 'var(--spacing-sm)' }}>
                {lodging ? 'Reservar na viagem' : 'Adicionar à viagem'}
              </Button>
            )}
          </section>
          <LoginToAct text={lodging ? 'Entre para colocar esta hospedagem numa viagem ou avaliá-la.' : 'Entre para colocar esta atividade numa viagem ou avaliá-la.'}>
            <ReviewForm create={createReview} what={lodging ? 'esta hospedagem' : 'esta atividade'} myRating={myReview?.rating} />
          </LoginToAct>
        </div>
      </div>

      {place.data && <AddToTripDialog open={adding} onClose={() => setAdding(false)} place={place.data} activity={a} />}
    </div>
  );
}
