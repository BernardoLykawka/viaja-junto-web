import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ChatCircleText, MapPin, Star } from '@phosphor-icons/react';
import { ApiError, errorMessage, fieldErrors } from '../lib/api';
import { money, rating } from '../lib/format';
import { useCatalogActivities, useCreateReview, useMe, usePlace, usePlaceReviews } from '../lib/queries';
import { Alert, Avatar, Button, EmptyState, Field, Skeleton } from '../components/ui';
import { categoryIcon } from '../components/Roteiro';

const sameText = (a: string | null | undefined, b: string | null | undefined) =>
  !!a && !!b && a.localeCompare(b, 'pt-BR', { sensitivity: 'base' }) === 0;

export function Destino() {
  const placeId = Number(useParams().id);
  const place = usePlace(placeId);
  const reviews = usePlaceReviews(placeId);
  const catalog = useCatalogActivities();
  const me = useMe();

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
  const activities = (catalog.data ?? []).filter((a) => sameText(a.city, p.city) || sameText(a.city, p.name));
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

      <div className="two-col" style={{ marginTop: 'var(--spacing-xl)' }}>
        <div className="stack">
          {p.description && (
            <section className="card">
              <h2 className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-sm)' }}>Sobre</h2>
              <p className="type-body-md">{p.description}</p>
            </section>
          )}

          <section className="card" aria-labelledby="aval-h">
            <h2 id="aval-h" className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Avaliações</h2>
            {reviews.isLoading && <Skeleton style={{ height: 120 }} />}
            {reviews.error && <Alert kind="error">{errorMessage(reviews.error)}</Alert>}
            {reviews.data && reviews.data.data.length === 0 && <EmptyState icon={ChatCircleText} text="Ninguém avaliou este destino ainda. Seja a primeira pessoa!" />}
            <ul className="list">
              {reviews.data?.data.map((r) => (
                <li key={r.id} style={{ alignItems: 'flex-start' }}>
                  <Avatar name={r.author.name} />
                  <div className="grow stack-sm">
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 'var(--spacing-sm)', flexWrap: 'wrap' }}>
                      <p className="type-title-md">{r.author.name}</p>
                      <Stars value={r.rating} />
                    </div>
                    {r.comment && <p className="type-body-md">{r.comment}</p>}
                    {r.createdAt && <p className="type-body-sm muted">{new Date(r.createdAt).toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })}</p>}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="stack">
          {myReview ? (
            <Alert kind="success">Você já avaliou este destino com {myReview.rating} {myReview.rating === 1 ? 'estrela' : 'estrelas'}.</Alert>
          ) : (
            <ReviewForm placeId={placeId} />
          )}

          <section className="card" aria-labelledby="ativ-h">
            <h2 id="ativ-h" className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-md)' }}>O que fazer</h2>
            {catalog.isLoading ? <Skeleton style={{ height: 120 }} /> : activities.length === 0 ? (
              <p className="type-body-sm muted">Ainda não há atividades do catálogo para este destino.</p>
            ) : (
              <ul className="list">
                {activities.map((a) => {
                  const I = categoryIcon(a.type);
                  return (
                    <li key={a.id}>
                      <span className="cat-icon"><I size={20} aria-hidden /></span>
                      <div className="grow">
                        <p className="type-title-md">{a.name}</p>
                        <p className="type-body-sm muted">{[a.type, a.location].filter(Boolean).join(' · ')}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        {a.averagePrice != null && <p className="type-numeric-md">{money(a.averagePrice)}</p>}
                        <p className="type-body-sm muted">★ {rating(a.averageRating)}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Stars({ value }: { value: number }) {
  return (
    <span className="stars" role="img" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} weight={n <= value ? 'fill' : 'regular'} aria-hidden />)}
    </span>
  );
}

function ReviewForm({ placeId }: { placeId: number }) {
  const create = useCreateReview(placeId);
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const errs = fieldErrors(create.error);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!nota) return;
    create.mutate({ nota, comentario: comentario.trim() || null }, { onSuccess: () => { setNota(0); setComentario(''); } });
  }

  return (
    <section className="card" aria-labelledby="avaliar-h">
      <h2 id="avaliar-h" className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Avaliar destino</h2>
      <form className="form" onSubmit={submit} noValidate>
        {create.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(create.error, 'avaliar este destino')}</Alert>}
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="type-label-md" style={{ marginBottom: 'var(--spacing-xs)' }}>Sua nota</legend>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="star-option">
                <input type="radio" name="nota" value={n} checked={nota === n} onChange={() => setNota(n)} className="sr-only" />
                <Star size={28} weight={n <= nota ? 'fill' : 'regular'} aria-hidden />
                <span className="sr-only">{n} {n === 1 ? 'estrela' : 'estrelas'}</span>
              </label>
            ))}
          </div>
          {errs.nota && <p className="type-body-sm field-error">{errs.nota}</p>}
        </fieldset>
        <Field label="Comentário" htmlFor="rv-coment" helper="Opcional. Até 1500 caracteres." error={errs.comentario}>
          <textarea id="rv-coment" maxLength={1500} value={comentario} onChange={(e) => setComentario(e.target.value)} />
        </Field>
        {create.isSuccess && <Alert kind="success">Obrigado! Sua avaliação foi publicada.</Alert>}
        <Button type="submit" busy={create.isPending} disabled={!nota}>Publicar avaliação</Button>
      </form>
    </section>
  );
}
