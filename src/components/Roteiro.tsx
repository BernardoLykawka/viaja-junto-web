import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Bed, Compass, MapPin, MapTrifold, Plus, Trash } from '@phosphor-icons/react';
import { ACTIVITY_TYPES, categoryIcon, isLodging, nights, normalizeType, sameCity } from '../lib/activityTypes';
import { errorMessage, fieldErrors } from '../lib/api';
import { dateLong, dateRange, dayHeading, money, timeOf } from '../lib/format';
import { useCatalogActivities, usePlaces, useTripActivities, useTripDestinations, useTripMutations } from '../lib/queries';
import type { Activity, Trip, TripDestination } from '../lib/types';
import { Alert, Button, Dialog, EmptyState, Field, Skeleton } from './ui';

export function Roteiro({ trip, canEdit }: { trip: Trip; canEdit: boolean }) {
  const destinations = useTripDestinations(trip.id);
  const activities = useTripActivities(trip.id);
  const mut = useTripMutations(trip.id);
  const [addingDestination, setAddingDestination] = useState(false);
  const [addingActivityTo, setAddingActivityTo] = useState<{ stop: TripDestination; lodging: boolean } | null>(null);

  const loading = destinations.isLoading || activities.isLoading;
  const error = destinations.error ?? activities.error ?? mut.removeDestination.error ?? mut.removeActivity.error;
  const stops = [...(destinations.data ?? [])].sort((a, b) => (a.order ?? 0) - (b.order ?? 0) || (a.arrivalDate ?? '').localeCompare(b.arrivalDate ?? ''));

  return (
    <section aria-labelledby="roteiro-h" className="stack">
      <div className="section-head">
        <h2 id="roteiro-h" className="type-headline-sm card-title">Roteiro</h2>
        {canEdit && <Button icon={Plus} onClick={() => setAddingDestination(true)}>Adicionar destino</Button>}
      </div>
      {error && <Alert kind="error">{errorMessage(error, 'editar o roteiro desta viagem')}</Alert>}
      {loading && <Skeleton style={{ height: 160 }} />}
      {!loading && stops.length === 0 && (
        <div className="card">
          <EmptyState icon={MapTrifold} text={canEdit ? 'Nenhum destino ainda. Adicione o primeiro para montar o roteiro!' : 'O roteiro ainda está vazio.'} action={canEdit ? <Button icon={Plus} onClick={() => setAddingDestination(true)}>Adicionar destino</Button> : undefined} />
        </div>
      )}
      {stops.map((s, i) => (
        <Stop key={s.id} index={i + 1} stop={s} activities={(activities.data ?? []).filter((a) => a.destinationId === s.id)} canEdit={canEdit}
          onAdd={(lodging) => setAddingActivityTo({ stop: s, lodging })}
          onRemoveStop={() => window.confirm(`Remover “${s.name}” e as atividades dele do roteiro?`) && mut.removeDestination.mutate(s.id)}
          onRemoveActivity={(a) => window.confirm(`Remover “${a.name}”?`) && mut.removeActivity.mutate(a.id)} />
      ))}
      <DestinationDialog tripId={trip.id} open={addingDestination} onClose={() => setAddingDestination(false)} />
      <ActivityDialog tripId={trip.id} target={addingActivityTo} onClose={() => setAddingActivityTo(null)} />
    </section>
  );
}

function Stop({ index, stop, activities, canEdit, onAdd, onRemoveStop, onRemoveActivity }: { index: number; stop: TripDestination; activities: Activity[]; canEdit: boolean; onAdd: (lodging: boolean) => void; onRemoveStop: () => void; onRemoveActivity: (a: Activity) => void }) {
  const byTime = (a: Activity, b: Activity) => (a.dateTime ?? '').localeCompare(b.dateTime ?? '');
  const stays = activities.filter((a) => isLodging(a.type)).sort(byTime);
  const todo = activities.filter((a) => !isLodging(a.type)).sort(byTime);
  const days = [...new Set(todo.map((a) => (a.dateTime ?? '').slice(0, 10)))];
  const remove = (a: Activity) => canEdit && (
    <button type="button" className="icon-button" aria-label={`Remover ${a.name}`} onClick={() => onRemoveActivity(a)}><Trash size={20} aria-hidden /></button>
  );

  return (
    <article className="card stop">
      <span className="stop-num type-title-md" aria-hidden>{index}</span>
      <div className="stack-sm" style={{ gap: 'var(--spacing-md)' }}>
        <div className="stop-head" style={{ marginBottom: 0 }}>
          <div>
            <h3 className="type-headline-sm card-title">{stop.name}{stop.country ? `, ${stop.country}` : ''}</h3>
            <p className="type-body-sm muted meta"><MapPin size={16} aria-hidden /> {dateRange(stop.arrivalDate, stop.departureDate)}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
            {stop.catalogId && <Link to={`/destinos/${stop.catalogId}`} className="type-label-md inline-link"><Compass size={20} aria-hidden /> Explorar {stop.name}</Link>}
            {canEdit && <Button variant="compact" icon={Trash} aria-label={`Remover destino ${stop.name}`} onClick={onRemoveStop} />}
          </div>
        </div>

        <section aria-label={`Hospedagem em ${stop.name}`} className="stack-sm">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h4 className="type-label-sm muted inline-link"><Bed size={16} aria-hidden /> Hospedagem</h4>
            {canEdit && <Button variant="compact" icon={Plus} onClick={() => onAdd(true)}>Hospedagem</Button>}
          </div>
          {stays.length === 0 ? (
            <p className="type-body-sm muted">{canEdit ? 'Onde o grupo vai ficar? Adicione um hotel, pousada ou apartamento.' : 'Hospedagem ainda não definida.'}</p>
          ) : (
            <ul className="activities">
              {stays.map((a) => {
                const n = nights(a.durationMinutes);
                return (
                  <li key={a.id} className="card-compact activity stay">
                    <span className="cat-icon"><Bed size={20} aria-hidden /></span>
                    <div>
                      <p className="type-title-md">{a.name}</p>
                      <p className="type-body-sm muted">{[a.dateTime ? `Check-in ${dateLong(a.dateTime)}` : 'Data a definir', n ? (n === 1 ? '1 noite' : `${n} noites`) : null, a.place].filter(Boolean).join(' · ')}</p>
                    </div>
                    <div className="right">
                      <span className="type-numeric-md">{a.estimatedCost != null ? money(a.estimatedCost) : 'Sem valor'}</span>
                      {remove(a)}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <section aria-label={`Atividades em ${stop.name}`} className="stack-sm">
          <div className="section-head" style={{ marginBottom: 0 }}>
            <h4 className="type-label-sm muted inline-link"><Compass size={16} aria-hidden /> O que fazer</h4>
            {canEdit && <Button variant="compact" icon={Plus} onClick={() => onAdd(false)}>Atividade</Button>}
          </div>
          {todo.length === 0 ? (
            <p className="type-body-sm muted">Nenhuma atividade planejada para este destino.</p>
          ) : (
            days.map((day) => (
              <div key={day || 'sem-data'} className="stack-sm">
                <h5 className="type-label-md">{day ? dayHeading(day) : 'Sem data'}</h5>
                <ul className="activities">
                  {todo.filter((a) => (a.dateTime ?? '').slice(0, 10) === day).map((a) => {
                    const I = categoryIcon(a.type);
                    return (
                      <li key={a.id} className="card-compact activity">
                        <span className="time type-numeric-md">{timeOf(a.dateTime)}</span>
                        <span className="cat-icon"><I size={20} aria-hidden /></span>
                        <div>
                          <p className="type-title-md">{a.name}</p>
                          <p className="type-body-sm muted">{[normalizeType(a.type) ?? a.type, a.place].filter(Boolean).join(' · ')}</p>
                        </div>
                        <div className="right">
                          <span className="type-numeric-md">{a.estimatedCost != null ? money(a.estimatedCost) : 'Sem valor'}</span>
                          {remove(a)}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>
    </article>
  );
}

const CUSTOM = '';

/** Destino do catálogo (o backend completa país, foto e descrição pelo destinoCatalogoId) ou um lugar livre. */
function DestinationDialog({ tripId, open, onClose }: { tripId: number; open: boolean; onClose: () => void }) {
  const { addDestination } = useTripMutations(tripId);
  const places = usePlaces('');
  const blank = { catalogId: CUSTOM, nome: '', pais: '', dataChegada: '', dataSaida: '' };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = fieldErrors(addDestination.error);
  const bad = f.dataChegada && f.dataSaida && f.dataSaida < f.dataChegada ? 'A saída precisa ser depois da chegada.' : undefined;

  useEffect(() => { if (open) { setF(blank); addDestination.reset(); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(id: string) {
    const p = places.data?.data.find((x) => String(x.id) === id);
    setF((prev) => ({ ...prev, catalogId: id, nome: p?.name ?? '', pais: p?.country ?? '' }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (bad) return;
    addDestination.mutate(
      { destinoCatalogoId: f.catalogId ? Number(f.catalogId) : null, nome: f.nome.trim(), pais: f.pais.trim() || null, dataChegada: f.dataChegada || null, dataSaida: f.dataSaida || null },
      { onSuccess: onClose },
    );
  }
  return (
    <Dialog open={open} onClose={onClose} title="Adicionar destino">
      <form className="form" onSubmit={submit} noValidate>
        {addDestination.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(addDestination.error, 'editar o roteiro desta viagem')}</Alert>}
        <Field label="Destino" htmlFor="d-cat" helper="Destinos do catálogo já trazem passeios e hospedagens sugeridos.">
          <select id="d-cat" value={f.catalogId} onChange={(e) => pick(e.target.value)}>
            <option value={CUSTOM}>Outro lugar (digitar)</option>
            {places.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name}, {p.country}</option>)}
          </select>
        </Field>
        {f.catalogId === CUSTOM && (
          <div className="form-row">
            <Field label="Cidade ou lugar" htmlFor="d-nome" error={errs.nome}><input id="d-nome" required value={f.nome} onChange={set('nome')} /></Field>
            <Field label="País" htmlFor="d-pais" error={errs.pais}><input id="d-pais" value={f.pais} onChange={set('pais')} /></Field>
          </div>
        )}
        <div className="form-row">
          <Field label="Chegada" htmlFor="d-ch" error={errs.dataChegada}><input id="d-ch" type="date" value={f.dataChegada} onChange={set('dataChegada')} /></Field>
          <Field label="Saída" htmlFor="d-sa" error={bad ?? errs.dataSaida}><input id="d-sa" type="date" min={f.dataChegada || undefined} value={f.dataSaida} onChange={set('dataSaida')} /></Field>
        </div>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={addDestination.isPending} disabled={!f.nome.trim()}>Adicionar</Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Atividade ou hospedagem dentro de um destino da viagem, do catálogo da cidade ou personalizada. */
function ActivityDialog({ tripId, target, onClose }: { tripId: number; target: { stop: TripDestination; lodging: boolean } | null; onClose: () => void }) {
  const { addActivity } = useTripMutations(tripId);
  const stop = target?.stop ?? null;
  const lodging = !!target?.lodging;
  const catalog = useCatalogActivities(stop?.name);
  const blank = { catalogoAtividadeId: CUSTOM, nome: '', tipo: lodging ? 'Hospedagem' : 'Passeio', local: '', data: '', hora: '', noites: '1', custoPrevisto: '' };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = fieldErrors(addActivity.error);
  const suggestions = (catalog.data ?? []).filter((a) => isLodging(a.type) === lodging && sameCity(a.city, stop?.name));

  useEffect(() => { if (target) { setF(blank); addActivity.reset(); } }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(id: string) {
    const a = suggestions.find((x) => String(x.id) === id);
    if (!a) return setF((p) => ({ ...p, catalogoAtividadeId: CUSTOM }));
    const n = Math.max(1, Number(f.noites) || 1);
    setF((p) => ({
      ...p,
      catalogoAtividadeId: id,
      nome: a.name,
      tipo: normalizeType(a.type) ?? p.tipo,
      local: a.location ?? '',
      custoPrevisto: a.averagePrice != null ? String(lodging ? a.averagePrice * n : a.averagePrice) : p.custoPrevisto,
    }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!stop) return;
    const n = Math.max(1, Number(f.noites) || 1);
    addActivity.mutate(
      {
        destinationId: stop.id,
        body: {
          catalogoAtividadeId: f.catalogoAtividadeId ? Number(f.catalogoAtividadeId) : null,
          nome: f.nome.trim(),
          tipo: lodging ? 'Hospedagem' : f.tipo,
          local: f.local.trim() || null,
          dataHorario: f.data ? `${f.data}T${f.hora || (lodging ? '14:00' : '09:00')}:00` : null,
          duracaoMinutos: lodging ? n * 1440 : null,
          custoPrevisto: f.custoPrevisto ? Number(f.custoPrevisto) : null,
        },
      },
      { onSuccess: onClose },
    );
  }

  const what = lodging ? 'hospedagem' : 'atividade';
  return (
    <Dialog open={!!target} onClose={onClose} title={stop ? `Nova ${what} em ${stop.name}` : `Nova ${what}`}>
      <form className="form" onSubmit={submit} noValidate>
        {addActivity.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(addActivity.error, 'editar o roteiro desta viagem')}</Alert>}
        {suggestions.length > 0 && (
          <Field label={lodging ? 'Hospedagens do catálogo' : 'Atividades do catálogo'} htmlFor="a-cat" helper="Escolha uma para preencher os campos, ou preencha você mesmo.">
            <select id="a-cat" value={f.catalogoAtividadeId} onChange={(e) => pick(e.target.value)}>
              <option value={CUSTOM}>{lodging ? 'Outra hospedagem' : 'Atividade personalizada'}</option>
              {suggestions.map((a) => <option key={a.id} value={a.id}>{a.name}{a.averagePrice != null ? ` · ${money(a.averagePrice)}${lodging ? '/noite' : ''}` : ''}</option>)}
            </select>
          </Field>
        )}
        <div className="form-row">
          <Field label="Nome" htmlFor="a-nome" error={errs.nome}><input id="a-nome" required value={f.nome} onChange={set('nome')} placeholder={lodging ? 'Ex.: Copacabana Palace' : 'Ex.: Cristo Redentor'} /></Field>
          {lodging ? (
            <Field label="Endereço ou bairro" htmlFor="a-local" error={errs.local}><input id="a-local" value={f.local} onChange={set('local')} /></Field>
          ) : (
            <Field label="Tipo" htmlFor="a-tipo">
              <select id="a-tipo" value={f.tipo} onChange={set('tipo')}>{ACTIVITY_TYPES.filter((t) => t !== 'Hospedagem').map((t) => <option key={t}>{t}</option>)}</select>
            </Field>
          )}
        </div>
        {!lodging && <Field label="Local" htmlFor="a-local" error={errs.local}><input id="a-local" value={f.local} onChange={set('local')} /></Field>}
        <div className="form-row">
          <Field label={lodging ? 'Check-in' : 'Data'} htmlFor="a-data" error={errs.dataHorario}>
            <input id="a-data" type="date" value={f.data} min={stop?.arrivalDate ?? undefined} max={stop?.departureDate ?? undefined} onChange={set('data')} />
          </Field>
          {lodging ? (
            <Field label="Noites" htmlFor="a-noites"><input id="a-noites" type="number" inputMode="numeric" min={1} max={60} value={f.noites} onChange={set('noites')} /></Field>
          ) : (
            <Field label="Horário" htmlFor="a-hora"><input id="a-hora" type="time" value={f.hora} onChange={set('hora')} /></Field>
          )}
        </div>
        <Field label={lodging ? 'Custo total da estadia (R$)' : 'Valor previsto (R$)'} htmlFor="a-custo" error={errs.custoPrevisto}>
          <input id="a-custo" type="number" inputMode="decimal" min={0} step="0.01" value={f.custoPrevisto} onChange={set('custoPrevisto')} />
        </Field>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={addActivity.isPending} disabled={!f.nome.trim()}>Adicionar</Button>
        </div>
      </form>
    </Dialog>
  );
}
