import { useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Compass, MagnifyingGlass, MapPin } from '@phosphor-icons/react';
import { ACTIVITY_TYPES, categoryIcon } from '../lib/activityTypes';
import { errorMessage } from '../lib/api';
import { useActivitiesPaged, usePlaces, usePlacesPaged } from '../lib/queries';
import { Alert, Button, EmptyState, LoadMore, Skeleton } from '../components/ui';
import { PhotoCard, RatingPill } from '../components/PhotoCard';
import { CatalogActivityCard } from '../components/CatalogActivityCard';
import { CategoryBadge } from '../components/CategoryBadge';
import { PLACE_CATEGORIES, placeCategory } from '../lib/placeCategories';
import type { Place } from '../lib/types';

type Tab = 'destinos' | 'atividades';

/** Catálogo público: destinos e atividades (passeios, cultura, gastronomia, hospedagem, transporte). */
export function Descobrir() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const tab: Tab = params.get('aba') === 'atividades' ? 'atividades' : 'destinos';
  const tipo = params.get('tipo');
  const categoria = params.get('categoria');
  const [text, setText] = useState(q);
  const places = usePlacesPaged(q, categoria);
  // Sem o filtro de categoria, para saber quantos destinos há em cada uma (o catálogo é pequeno).
  const allPlaces = usePlaces(q);
  const activities = useActivitiesPaged(q, tipo);

  const update = (next: Record<string, string | null>) => {
    const merged: Record<string, string> = {};
    for (const [k, v] of Object.entries({ q, aba: tab === 'atividades' ? 'atividades' : null, tipo, categoria, ...next })) if (v) merged[k] = v;
    setParams(merged, { replace: true });
  };

  function submit(e: FormEvent) {
    e.preventDefault();
    update({ q: text.trim() || null });
  }

  const skeletons = <ul className="grid-cards">{Array.from({ length: 8 }, (_, i) => <li key={i}><Skeleton style={{ height: 260, borderRadius: 'var(--radius-lg)' }} /></li>)}</ul>;

  return (
    <div className="container page-work stack">
      <div>
        <h1 className="type-headline-lg page-title">Descobrir</h1>
        <p className="type-body-md muted" style={{ marginTop: 'var(--spacing-sm)' }}>Destinos e atividades avaliados pela comunidade do ViajaJunto.</p>
      </div>

      <form onSubmit={submit} role="search" style={{ display: 'flex', gap: 'var(--spacing-sm-plus)', flexWrap: 'wrap' }}>
        <label className="sr-only" htmlFor="busca">Buscar destino ou atividade</label>
        <input id="busca" className="input" style={{ flex: 1, minWidth: 220, maxWidth: 480 }} placeholder="Cidade, país ou atividade" value={text} onChange={(e) => setText(e.target.value)} />
        <Button type="submit" icon={MagnifyingGlass}>Buscar</Button>
      </form>

      <div className="tabs" role="tablist" aria-label="O que mostrar" style={{ margin: 0 }}>
        {(['destinos', 'atividades'] as Tab[]).map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} className="tab type-label-lg" onClick={() => update({ aba: t === 'atividades' ? 'atividades' : null, tipo: null, categoria: null })}>
            {t === 'destinos' ? <MapPin size={20} aria-hidden /> : <Compass size={20} aria-hidden />}
            {t === 'destinos' ? 'Destinos' : 'Atividades'}
            <span className="count">{(t === 'destinos' ? places.totalItems : activities.totalItems) ?? '–'}</span>
          </button>
        ))}
      </div>

      {tab === 'destinos' ? (
        <section aria-label="Destinos" className="stack">
          <CategoryChips selected={categoria} counts={categoryCounts(allPlaces.data?.data ?? [])} total={allPlaces.data?.totalItems} onSelect={(c) => update({ categoria: c })} />
          {places.error && <Alert kind="error" action={<Button variant="compact" onClick={() => void places.refetch()}>Tentar de novo</Button>}>{errorMessage(places.error)}</Alert>}
          {places.isLoading ? skeletons : places.items.length ? (
            <>
            <ul className="grid-cards">
              {places.items.map((p) => (
                <li key={p.id}>
                  <PhotoCard to={`/destinos/${p.id}`} photoUrl={p.photoUrl} alt={`Foto de ${p.name}`} title={p.name} subtitle={[p.city !== p.name ? p.city : null, p.country].filter(Boolean).join(', ')} badge={<CategoryBadge category={p.category} />} corner={<RatingPill value={p.averageRating} />} />
                </li>
              ))}
            </ul>
            <LoadMore hasMore={!!places.hasNextPage} loading={places.isFetchingNextPage} onClick={() => void places.fetchNextPage()} label="Mais destinos" />
            </>
          ) : !places.error && <EmptyState icon={MapPin} text={categoria ? `Nenhum destino na categoria “${placeCategory(categoria)?.label}”${q ? ` para “${q}”` : ''}.` : q ? `Nenhum destino encontrado para “${q}”. Tente outro nome.` : 'Nenhum destino cadastrado ainda.'} />}
        </section>
      ) : (
        <section aria-label="Atividades" className="stack">
          <div className="chips" role="group" aria-label="Filtrar por tipo">
            <button type="button" className="chip type-label-md" aria-pressed={!tipo} onClick={() => update({ tipo: null })}>Todas</button>
            {ACTIVITY_TYPES.map((t) => {
              const I = categoryIcon(t);
              return (
                <button key={t} type="button" className="chip type-label-md" aria-pressed={tipo === t} onClick={() => update({ tipo: tipo === t ? null : t })}>
                  <I size={16} aria-hidden /> {t}
                </button>
              );
            })}
          </div>
          {activities.error && <Alert kind="error" action={<Button variant="compact" onClick={() => void activities.refetch()}>Tentar de novo</Button>}>{errorMessage(activities.error)}</Alert>}
          {activities.isLoading ? skeletons : activities.items.length ? (
            <>
              <ul className="grid-cards">{activities.items.map((a) => <li key={a.id}><CatalogActivityCard a={a} /></li>)}</ul>
              <LoadMore hasMore={!!activities.hasNextPage} loading={activities.isFetchingNextPage} onClick={() => void activities.fetchNextPage()} label="Mais atividades" />
            </>
          ) : !activities.error && <EmptyState icon={Compass} text={q || tipo ? 'Nenhuma atividade encontrada com esses filtros.' : 'Nenhuma atividade cadastrada ainda.'} />}
        </section>
      )}
    </div>
  );
}

function categoryCounts(places: Place[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const p of places) {
    const c = placeCategory(p.category);
    if (c) m.set(c.id, (m.get(c.id) ?? 0) + 1);
  }
  return m;
}

/** Filtro por categoria: mostra as categorias conhecidas que têm destinos e qualquer outra que o catálogo trouxer. */
function CategoryChips({ selected, counts, total, onSelect }: { selected: string | null; counts: Map<string, number>; total?: number; onSelect: (c: string | null) => void }) {
  const known = PLACE_CATEGORIES.filter((c) => counts.has(c.id));
  const extra = [...counts.keys()].filter((k) => !PLACE_CATEGORIES.some((c) => c.id === k)).map((k) => placeCategory(k)!);
  const sel = placeCategory(selected)?.id ?? null;
  return (
    <div className="chips" role="group" aria-label="Filtrar por categoria">
      <button type="button" className="chip type-label-md" aria-pressed={!sel} onClick={() => onSelect(null)}>
        Todas {total != null && <span className="muted">({total})</span>}
      </button>
      {[...known, ...extra].map((c) => (
        <button key={c.id} type="button" className="chip type-label-md" aria-pressed={sel === c.id} onClick={() => onSelect(sel === c.id ? null : c.id)}>
          <c.icon size={16} aria-hidden /> {c.label} <span className="muted">({counts.get(c.id)})</span>
        </button>
      ))}
    </div>
  );
}
