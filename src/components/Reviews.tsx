import { useState, type FormEvent } from 'react';
import { ChatCircleText, Star } from '@phosphor-icons/react';
import type { UseMutationResult } from '@tanstack/react-query';
import type { Paged } from '../lib/queries';
import { errorMessage, fieldErrors } from '../lib/api';
import type { Review } from '../lib/types';
import { Alert, Avatar, Button, EmptyState, Field, LoadMore, Skeleton } from './ui';

export function Stars({ value }: { value: number }) {
  return (
    <span className="stars" role="img" aria-label={`${value} de 5 estrelas`}>
      {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} weight={n <= value ? 'fill' : 'regular'} aria-hidden />)}
    </span>
  );
}

export function ReviewList({ query, emptyText }: { query: Paged<Review>; emptyText: string }) {
  if (query.isLoading) return <Skeleton style={{ height: 120 }} />;
  if (query.error) return <Alert kind="error">{errorMessage(query.error)}</Alert>;
  if (!query.items.length) return <EmptyState icon={ChatCircleText} text={emptyText} />;
  return (
    <>
    <ul className="list">
      {query.items.map((r) => (
        <li key={r.id} style={{ alignItems: 'flex-start' }}>
          <Avatar name={r.author.name} src={r.author.avatarUrl} />
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
    <LoadMore hasMore={!!query.hasNextPage} loading={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()} label="Ver mais avaliações" />
    </>
  );
}

type CreateReview = UseMutationResult<unknown, Error, { nota: number; comentario: string | null }>;

/** Formulário de nota de 1 a 5 estrelas + comentário. `what` entra no título e na mensagem de 403. */
export function ReviewForm({ create, what, myRating }: { create: CreateReview; what: string; myRating?: number }) {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState('');
  const errs = fieldErrors(create.error);

  if (myRating) return <Alert kind="success">Você já avaliou {what} com {myRating} {myRating === 1 ? 'estrela' : 'estrelas'}.</Alert>;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!nota) return;
    create.mutate({ nota, comentario: comentario.trim() || null }, { onSuccess: () => { setNota(0); setComentario(''); } });
  }

  const name = `nota-${what.replace(/\W+/g, '-')}`;
  return (
    <section className="card" aria-label={`Avaliar ${what}`}>
      <h2 className="type-headline-sm card-title" style={{ marginBottom: 'var(--spacing-md)' }}>Avaliar {what}</h2>
      <form className="form" onSubmit={submit} noValidate>
        {create.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(create.error, `avaliar ${what}`)}</Alert>}
        <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
          <legend className="type-label-md" style={{ marginBottom: 'var(--spacing-xs)' }}>Sua nota</legend>
          <div className="star-picker">
            {[1, 2, 3, 4, 5].map((n) => (
              <label key={n} className="star-option">
                <input type="radio" name={name} value={n} checked={nota === n} onChange={() => setNota(n)} className="sr-only" />
                <Star size={28} weight={n <= nota ? 'fill' : 'regular'} aria-hidden />
                <span className="sr-only">{n} {n === 1 ? 'estrela' : 'estrelas'}</span>
              </label>
            ))}
          </div>
          {errs.nota && <p className="type-body-sm field-error">{errs.nota}</p>}
        </fieldset>
        <Field label="Comentário" htmlFor={`${name}-coment`} helper="Opcional. Até 1500 caracteres." error={errs.comentario}>
          <textarea id={`${name}-coment`} maxLength={1500} value={comentario} onChange={(e) => setComentario(e.target.value)} />
        </Field>
        {create.isSuccess && <Alert kind="success">Obrigado! Sua avaliação foi publicada.</Alert>}
        <Button type="submit" busy={create.isPending} disabled={!nota}>Publicar avaliação</Button>
      </form>
    </section>
  );
}
