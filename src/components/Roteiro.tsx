import { useState, type FormEvent } from 'react';
import { Bed, Bus, DotsThree, ForkKnife, MapPin, MapTrifold, Plus, Ticket, Trash, type Icon } from '@phosphor-icons/react';
import { errorMessage, fieldErrors } from '../lib/api';
import { dateRange, dayHeading, money, timeOf } from '../lib/format';
import { useTripActivities, useTripDestinations, useTripMutations } from '../lib/queries';
import type { Activity, Trip, TripDestination } from '../lib/types';
import { Alert, Button, Dialog, EmptyState, Field, Skeleton } from './ui';

const CATEGORY_ICONS: [RegExp, Icon][] = [
  [/comid|aliment|restaur/i, ForkKnife],
  [/hosped|hotel|estadia/i, Bed],
  [/transp|voo|trem|ônibus|onibus/i, Bus],
  [/passeio|tour|ingresso|atra/i, Ticket],
];
export const categoryIcon = (type: string | null): Icon => CATEGORY_ICONS.find(([re]) => type && re.test(type))?.[1] ?? DotsThree;

export function Roteiro({ trip, canEdit }: { trip: Trip; canEdit: boolean }) {
  const destinations = useTripDestinations(trip.id);
  const activities = useTripActivities(trip.id);
  const mut = useTripMutations(trip.id);
  const [addingDestination, setAddingDestination] = useState(false);
  const [addingActivityTo, setAddingActivityTo] = useState<TripDestination | null>(null);

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
          onAddActivity={() => setAddingActivityTo(s)}
          onRemoveStop={() => window.confirm(`Remover “${s.name}” e as atividades dele do roteiro?`) && mut.removeDestination.mutate(s.id)}
          onRemoveActivity={(a) => window.confirm(`Remover “${a.name}”?`) && mut.removeActivity.mutate(a.id)} />
      ))}
      <DestinationDialog tripId={trip.id} open={addingDestination} onClose={() => setAddingDestination(false)} />
      <ActivityDialog tripId={trip.id} destination={addingActivityTo} onClose={() => setAddingActivityTo(null)} />
    </section>
  );
}

function Stop({ index, stop, activities, canEdit, onAddActivity, onRemoveStop, onRemoveActivity }: { index: number; stop: TripDestination; activities: Activity[]; canEdit: boolean; onAddActivity: () => void; onRemoveStop: () => void; onRemoveActivity: (a: Activity) => void }) {
  const sorted = [...activities].sort((a, b) => (a.dateTime ?? '').localeCompare(b.dateTime ?? ''));
  const days = [...new Set(sorted.map((a) => (a.dateTime ?? '').slice(0, 10)))];
  return (
    <article className="card stop">
      <span className="stop-num type-title-md" aria-hidden>{index}</span>
      <div>
        <div className="stop-head">
          <div>
            <h3 className="type-headline-sm card-title">{stop.name}{stop.country ? `, ${stop.country}` : ''}</h3>
            <p className="type-body-sm muted meta"><MapPin size={16} aria-hidden /> {dateRange(stop.arrivalDate, stop.departureDate)}</p>
          </div>
          {canEdit && (
            <div style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
              <Button variant="compact" icon={Plus} onClick={onAddActivity}>Atividade</Button>
              <Button variant="compact" icon={Trash} aria-label={`Remover destino ${stop.name}`} onClick={onRemoveStop} />
            </div>
          )}
        </div>
        {sorted.length === 0 ? (
          <p className="type-body-sm muted">Nenhuma atividade planejada para este destino.</p>
        ) : (
          days.map((day) => (
            <div key={day || 'sem-data'} className="stack-sm" style={{ marginBottom: 'var(--spacing-md)' }}>
              <h4 className="type-label-sm muted">{day ? dayHeading(day) : 'Sem data'}</h4>
              <ul className="activities">
                {sorted.filter((a) => (a.dateTime ?? '').slice(0, 10) === day).map((a) => {
                  const I = categoryIcon(a.type);
                  return (
                    <li key={a.id} className="card-compact activity">
                      <span className="time type-numeric-md">{timeOf(a.dateTime)}</span>
                      <span className="cat-icon"><I size={20} aria-hidden /></span>
                      <div>
                        <p className="type-title-md">{a.name}</p>
                        <p className="type-body-sm muted">{[a.type, a.place].filter(Boolean).join(' · ')}</p>
                      </div>
                      <div className="right">
                        <span className="type-numeric-md">{a.estimatedCost != null ? money(a.estimatedCost) : 'Sem valor'}</span>
                        {canEdit && <button type="button" className="icon-button" aria-label={`Remover atividade ${a.name}`} onClick={() => onRemoveActivity(a)}><Trash size={20} aria-hidden /></button>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </article>
  );
}

function DestinationDialog({ tripId, open, onClose }: { tripId: number; open: boolean; onClose: () => void }) {
  const { addDestination } = useTripMutations(tripId);
  const [f, setF] = useState({ nome: '', pais: '', dataChegada: '', dataSaida: '' });
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = fieldErrors(addDestination.error);
  const bad = f.dataChegada && f.dataSaida && f.dataSaida < f.dataChegada ? 'A saída precisa ser depois da chegada.' : undefined;
  function submit(e: FormEvent) {
    e.preventDefault();
    if (bad) return;
    addDestination.mutate({ nome: f.nome.trim(), pais: f.pais.trim() || null, dataChegada: f.dataChegada || null, dataSaida: f.dataSaida || null }, { onSuccess: () => { setF({ nome: '', pais: '', dataChegada: '', dataSaida: '' }); onClose(); } });
  }
  return (
    <Dialog open={open} onClose={onClose} title="Adicionar destino">
      <form className="form" onSubmit={submit} noValidate>
        {addDestination.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(addDestination.error, 'editar o roteiro desta viagem')}</Alert>}
        <Field label="Cidade ou lugar" htmlFor="d-nome" error={errs.nome}><input id="d-nome" required value={f.nome} onChange={set('nome')} /></Field>
        <Field label="País" htmlFor="d-pais" error={errs.pais}><input id="d-pais" value={f.pais} onChange={set('pais')} /></Field>
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

const TYPES = ['Passeio', 'Comida', 'Hospedagem', 'Transporte', 'Outros'];

function ActivityDialog({ tripId, destination, onClose }: { tripId: number; destination: TripDestination | null; onClose: () => void }) {
  const { addActivity } = useTripMutations(tripId);
  const blank = { nome: '', tipo: TYPES[0]!, dataHorario: '', custoPrevisto: '' };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = fieldErrors(addActivity.error);
  function submit(e: FormEvent) {
    e.preventDefault();
    if (!destination) return;
    addActivity.mutate(
      { destinationId: destination.id, body: { nome: f.nome.trim(), tipo: f.tipo, dataHorario: f.dataHorario || null, custoPrevisto: f.custoPrevisto ? Number(f.custoPrevisto) : null } },
      { onSuccess: () => { setF(blank); onClose(); } },
    );
  }
  return (
    <Dialog open={!!destination} onClose={onClose} title={destination ? `Nova atividade em ${destination.name}` : 'Nova atividade'}>
      <form className="form" onSubmit={submit} noValidate>
        {addActivity.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(addActivity.error, 'editar o roteiro desta viagem')}</Alert>}
        <Field label="Nome" htmlFor="a-nome" error={errs.nome}><input id="a-nome" required value={f.nome} onChange={set('nome')} /></Field>
        <div className="form-row">
          <Field label="Tipo" htmlFor="a-tipo"><select id="a-tipo" value={f.tipo} onChange={set('tipo')}>{TYPES.map((t) => <option key={t}>{t}</option>)}</select></Field>
          <Field label="Valor previsto (R$)" htmlFor="a-custo" error={errs.custoPrevisto}><input id="a-custo" type="number" inputMode="decimal" min={0} step="0.01" value={f.custoPrevisto} onChange={set('custoPrevisto')} /></Field>
        </div>
        <Field label="Data e hora" htmlFor="a-data" error={errs.dataHorario}><input id="a-data" type="datetime-local" value={f.dataHorario} onChange={set('dataHorario')} /></Field>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={addActivity.isPending} disabled={!f.nome.trim()}>Adicionar</Button>
        </div>
      </form>
    </Dialog>
  );
}
