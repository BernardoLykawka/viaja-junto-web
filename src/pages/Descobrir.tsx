import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlass, MapPin } from '@phosphor-icons/react';
import { errorMessage } from '../lib/api';
import { usePlaces } from '../lib/queries';
import { Alert, Button, EmptyState, Skeleton } from '../components/ui';
import { PhotoCard, RatingPill } from '../components/PhotoCard';

export function Descobrir() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const [text, setText] = useState(q);
  const { data, isLoading, error, refetch } = usePlaces(q);

  function submit(e: FormEvent) {
    e.preventDefault();
    setParams(text.trim() ? { q: text.trim() } : {});
  }

  return (
    <div className="container page-work">
      <h1 className="type-headline-lg page-title">Descobrir destinos</h1>
      <p className="type-body-md muted" style={{ marginTop: 'var(--spacing-sm)' }}>Lugares avaliados pela comunidade do ViajaJunto.</p>

      <form onSubmit={submit} role="search" style={{ display: 'flex', gap: 'var(--spacing-sm-plus)', margin: 'var(--spacing-lg) 0', flexWrap: 'wrap' }}>
        <label className="sr-only" htmlFor="busca">Buscar destino</label>
        <input id="busca" className="input" style={{ flex: 1, minWidth: 220, maxWidth: 480 }} placeholder="Para onde você quer ir?" value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" icon={MagnifyingGlass}>Buscar</Button>
      </form>

      {error && <Alert kind="error" action={<Button variant="compact" onClick={() => void refetch()}>Tentar de novo</Button>}>{errorMessage(error)}</Alert>}

      <ul className="grid-cards" aria-busy={isLoading}>
        {isLoading && Array.from({ length: 8 }, (_, i) => <li key={i}><Skeleton style={{ height: 260, borderRadius: 'var(--radius-lg)' }} /></li>)}
        {data?.data.map((p) => (
          <li key={p.id}>
            <PhotoCard to={`/destinos/${p.id}`} photoUrl={p.photoUrl} alt={`Foto de ${p.name}`} title={p.name} subtitle={[p.city, p.country].filter(Boolean).join(', ')} corner={<RatingPill value={p.averageRating} />} />
          </li>
        ))}
      </ul>
      {data && data.data.length === 0 && <EmptyState icon={MapPin} text={q ? `Nenhum destino encontrado para “${q}”. Tente outro nome.` : 'Nenhum destino cadastrado ainda.'} />}
    </div>
  );
}
