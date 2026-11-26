import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, Bed, Compass, MapPin, MapTrifold, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { ACTIVITY_TYPES, categoryIcon, isLodging, nights, normalizeType, sameCity } from '../lib/activityTypes';
import { errorMessage, fieldErrors } from '../lib/api';
import { dateLong, dateRange, dayHeading, duration, endTime, money, timeOf } from '../lib/format';
import { ACTIVITY_STATUS_META, ACTIVITY_STATUSES } from '../lib/activityStatus';
import { ACTIVITY_STATUS_TO_API } from '../lib/adapters';
import { useCatalogActivities, usePlaces, useTripActivities, useTripDestinations, useTripMutations } from '../lib/queries';
import type { Activity, ActivityStatus, Trip, TripDestination } from '../lib/types';
import { Alert, Button, Dialog, EmptyState, Field, Skeleton } from './ui';
import { FadeImg } from './FadeImg';

export function Roteiro({ trip, canEdit }: { trip: Trip; canEdit: boolean }) {
  const destinations = useTripDestinations(trip.id);
  const activities = useTripActivities(trip.id);
  const mut = useTripMutations(trip.id);
  const [addingDestination, setAddingDestination] = useState(false);
  const [editingDestination, setEditingDestination] = useState<TripDestination | null>(null);
  const [addingActivityTo, setAddingActivityTo] = useState<ActivityTarget | null>(null);

  const loading = destinations.isLoading || activities.isLoading;
  const error = destinations.error ?? activities.error ?? mut.removeDestination.error ?? mut.removeActivity.error ?? mut.updateDestination.error;
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
          onEditActivity={(a) => setAddingActivityTo({ stop: s, lodging: isLodging(a.type), activity: a })}
          onRemoveStop={() => window.confirm(`Remover “${s.name}” e as atividades dele do roteiro?`) && mut.removeDestination.mutate(s.id)}
          onEditStop={() => setEditingDestination(s)}
          onMove={i > 0 || i < stops.length - 1 ? (dir) => mut.updateDestination.mutate({ id: s.id, body: { ordemVisita: i + 1 + dir } }) : undefined}
          isFirst={i === 0}
          isLast={i === stops.length - 1}
          moving={mut.updateDestination.isPending}
          onRemoveActivity={(a) => window.confirm(`Remover “${a.name}”?`) && mut.removeActivity.mutate(a.id)} />
      ))}
      <DestinationDialog tripId={trip.id} open={addingDestination} onClose={() => setAddingDestination(false)} />
      <DestinationDialog tripId={trip.id} open={!!editingDestination} editing={editingDestination} position={editingDestination ? stops.findIndex((x) => x.id === editingDestination.id) + 1 : 0} total={stops.length} onClose={() => setEditingDestination(null)} />
      <ActivityDialog tripId={trip.id} target={addingActivityTo} onClose={() => setAddingActivityTo(null)} />
    </section>
  );
}

function Stop({ index, stop, activities, canEdit, onAdd, onEditActivity, onRemoveStop, onRemoveActivity, onEditStop, onMove, isFirst, isLast, moving }: { index: number; stop: TripDestination; activities: Activity[]; canEdit: boolean; onAdd: (lodging: boolean) => void; onEditActivity: (a: Activity) => void; onRemoveStop: () => void; onRemoveActivity: (a: Activity) => void; onEditStop: () => void; onMove?: (dir: -1 | 1) => void; isFirst: boolean; isLast: boolean; moving: boolean }) {
  const byTime = (a: Activity, b: Activity) => (a.dateTime ?? '').localeCompare(b.dateTime ?? '');
  const stays = activities.filter((a) => isLodging(a.type)).sort(byTime);
  const todo = activities.filter((a) => !isLodging(a.type)).sort(byTime);
  const days = [...new Set(todo.map((a) => (a.dateTime ?? '').slice(0, 10)))];
  const remove = (a: Activity) => canEdit && (
    <span className="activity-actions">
      <button type="button" className="icon-button" aria-label={`Editar ${a.name}`} onClick={() => onEditActivity(a)}><PencilSimple size={20} aria-hidden /></button>
      <button type="button" className="icon-button" aria-label={`Remover ${a.name}`} onClick={() => onRemoveActivity(a)}><Trash size={20} aria-hidden /></button>
    </span>
  );

  return (
    <article className="card stop">
      <span className="stop-num type-title-md" aria-hidden>{index}</span>
      <div className="stack-sm" style={{ gap: 'var(--spacing-md)' }}>
        <div className="stop-head" style={{ marginBottom: 0 }}>
          <div>
            <h3 className="type-headline-sm card-title">
              {/* Destino do catálogo: o nome abre a página dele (passeios, hospedagens e avaliações). */}
              {stop.catalogId ? (
                <Link to={`/destinos/${stop.catalogId}`} className="stop-link">{stop.name}{stop.country ? `, ${stop.country}` : ''}</Link>
              ) : (
                <>{stop.name}{stop.country ? `, ${stop.country}` : ''}</>
              )}
            </h3>
            <p className="type-body-sm muted meta"><MapPin size={16} aria-hidden /> {dateRange(stop.arrivalDate, stop.departureDate)}</p>
          </div>
          <div style={{ display: 'flex', gap: 'var(--spacing-sm)', flexWrap: 'wrap', alignItems: 'center' }}>
            {canEdit && onMove && (
              <span className="stop-move">
                <button type="button" className="icon-button" disabled={isFirst || moving} onClick={() => onMove(-1)} aria-label={`Subir ${stop.name} no roteiro`}><ArrowUp size={20} aria-hidden /></button>
                <button type="button" className="icon-button" disabled={isLast || moving} onClick={() => onMove(1)} aria-label={`Descer ${stop.name} no roteiro`}><ArrowDown size={20} aria-hidden /></button>
              </span>
            )}
            {canEdit && <Button variant="compact" icon={PencilSimple} aria-label={`Editar destino ${stop.name}`} onClick={onEditStop} />}
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
                  <ActivityRow key={a.id} a={a} lodging remove={remove(a)}
                    detail={[a.dateTime ? `Check-in ${dateLong(a.dateTime)}` : 'Data a definir', n ? (n === 1 ? '1 noite' : `${n} noites`) : null, a.place].filter(Boolean).join(' · ')} />
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
                  {todo.filter((a) => (a.dateTime ?? '').slice(0, 10) === day).map((a) => (
                      <ActivityRow key={a.id} a={a} time={timeOf(a.dateTime)} remove={remove(a)}
                        detail={[normalizeType(a.type) ?? a.type, a.place].filter(Boolean).join(' · ')} />
                  ))}
                </ul>
              </div>
            ))
          )}
        </section>
      </div>
    </article>
  );
}

/**
 * Linha de atividade ou hospedagem do roteiro. Vinda do catálogo, mostra a foto dele e o card inteiro abre a
 * página da atividade (/atividades/{id}); o botão de remover fica por cima do link.
 */
export function ActivityRow({ a, detail, time, lodging, remove }: { a: Activity; detail: string; time?: string; lodging?: boolean; remove: React.ReactNode }) {
  const I = lodging ? Bed : categoryIcon(a.type);
  const showTime = !lodging && !!time;
  const st = ACTIVITY_STATUS_META[a.status];
  const end = showTime ? endTime(time!, a.durationMinutes) : null;
  const dur = lodging ? null : duration(a.durationMinutes);
  return (
    <li className={`card-compact activity ${showTime ? '' : 'no-time'} ${a.catalogId != null ? 'is-link' : ''} ${a.status === 'DONE' ? 'is-done' : ''}`}>
      {showTime && (
        <span className="time type-numeric-md">
          {time}
          {end && <span className="type-body-sm muted time-end">até {end}</span>}
        </span>
      )}
      {a.photoUrl ? (
        <FadeImg className="activity-thumb" src={a.photoUrl} width={160} alt="" loading="lazy" />
      ) : (
        <span className="cat-icon activity-thumb"><I size={22} aria-hidden /></span>
      )}
      <div style={{ minWidth: 0 }}>
        {a.catalogId != null ? (
          <Link to={`/atividades/${a.catalogId}`} className="type-title-md activity-link">{a.name}</Link>
        ) : (
          <p className="type-title-md">{a.name}</p>
        )}
        <p className="type-body-sm muted">{[detail, dur].filter(Boolean).join(' · ')}</p>
        {a.description && <p className="type-body-sm activity-notes" title={a.description}>{a.description}</p>}
      </div>
      <div className="right">
        <span className={`badge ${st.badge} type-label-sm`}><st.icon size={14} weight="fill" aria-hidden /> {st.label}</span>
        <span className="type-numeric-md">{a.estimatedCost != null ? money(a.estimatedCost) : 'Sem valor'}</span>
        {remove}
      </div>
    </li>
  );
}

const CUSTOM = '';

/** Destino do catálogo (o backend completa país, foto e descrição pelo destinoCatalogoId) ou um lugar livre. */
function DestinationDialog({ tripId, open, onClose, editing = null, position = 0, total = 0 }: { tripId: number; open: boolean; onClose: () => void; editing?: TripDestination | null; position?: number; total?: number }) {
  const { addDestination, updateDestination } = useTripMutations(tripId);
  const mutation = editing ? updateDestination : addDestination;
  const places = usePlaces('');
  const blank = { catalogId: CUSTOM, nome: '', pais: '', dataChegada: '', dataSaida: '', ordem: '' };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = fieldErrors(mutation.error);
  const bad = f.dataChegada && f.dataSaida && f.dataSaida < f.dataChegada ? 'A saída precisa ser depois da chegada.' : undefined;

  useEffect(() => {
    if (!open) return;
    setF(editing
      ? { catalogId: editing.catalogId != null ? String(editing.catalogId) : CUSTOM, nome: editing.name, pais: editing.country ?? '', dataChegada: editing.arrivalDate ?? '', dataSaida: editing.departureDate ?? '', ordem: String(position) }
      : blank);
    addDestination.reset();
    updateDestination.reset();
  }, [open, editing]); // eslint-disable-line react-hooks/exhaustive-deps

  function pick(id: string) {
    const p = places.data?.data.find((x) => String(x.id) === id);
    setF((prev) => ({ ...prev, catalogId: id, nome: p?.name ?? '', pais: p?.country ?? '' }));
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (bad) return;
    if (editing) {
      // PATCH: só manda o que mudou (país vazio apaga; datas vazias ficam como estavam).
      const body: Record<string, unknown> = {};
      if (f.nome.trim() !== editing.name) body.nome = f.nome.trim();
      if (f.pais.trim() !== (editing.country ?? '')) body.pais = f.pais.trim();
      if (f.dataChegada && f.dataChegada !== editing.arrivalDate) body.dataChegada = f.dataChegada;
      if (f.dataSaida && f.dataSaida !== editing.departureDate) body.dataSaida = f.dataSaida;
      if (f.ordem && Number(f.ordem) !== position) body.ordemVisita = Number(f.ordem);
      if (Object.keys(body).length === 0) return onClose();
      updateDestination.mutate({ id: editing.id, body }, { onSuccess: onClose });
      return;
    }
    addDestination.mutate(
      { destinoCatalogoId: f.catalogId ? Number(f.catalogId) : null, nome: f.nome.trim(), pais: f.pais.trim() || null, dataChegada: f.dataChegada || null, dataSaida: f.dataSaida || null },
      { onSuccess: onClose },
    );
  }
  return (
    <Dialog open={open} onClose={onClose} title={editing ? `Editar ${editing.name}` : 'Adicionar destino'}>
      <form className="form" onSubmit={submit} noValidate>
        {mutation.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(mutation.error, 'editar o roteiro desta viagem')}</Alert>}
        {!editing && (
          <Field label="Destino" htmlFor="d-cat" helper="Destinos do catálogo já trazem passeios e hospedagens sugeridos.">
            <select id="d-cat" value={f.catalogId} onChange={(e) => pick(e.target.value)}>
              <option value={CUSTOM}>Outro lugar (digitar)</option>
              {places.data?.data.map((p) => <option key={p.id} value={p.id}>{p.name}, {p.country}</option>)}
            </select>
          </Field>
        )}
        {(editing || f.catalogId === CUSTOM) && (
          <div className="form-row">
            <Field label="Cidade ou lugar" htmlFor="d-nome" error={errs.nome}><input id="d-nome" required value={f.nome} onChange={set('nome')} /></Field>
            <Field label="País" htmlFor="d-pais" error={errs.pais}><input id="d-pais" value={f.pais} onChange={set('pais')} /></Field>
          </div>
        )}
        <div className="form-row">
          <Field label="Chegada" htmlFor="d-ch" error={errs.dataChegada}><input id="d-ch" type="date" value={f.dataChegada} onChange={set('dataChegada')} /></Field>
          <Field label="Saída" htmlFor="d-sa" error={bad ?? errs.dataSaida}><input id="d-sa" type="date" min={f.dataChegada || undefined} value={f.dataSaida} onChange={set('dataSaida')} /></Field>
        </div>
        {editing && total > 1 && (
          <Field label="Posição no roteiro" htmlFor="d-ordem" helper="Os outros destinos se ajustam sozinhos." error={errs.ordemVisita}>
            <select id="d-ordem" value={f.ordem} onChange={set('ordem')}>
              {Array.from({ length: total }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1}º destino</option>)}
            </select>
          </Field>
        )}
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={mutation.isPending} disabled={!f.nome.trim()}>{editing ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Dialog>
  );
}

/** Atividade ou hospedagem dentro de um destino da viagem, do catálogo da cidade ou personalizada. */
/** Abrir o formulário de atividade: num destino, para hospedagem ou não, e com `activity` quando é edição. */
type ActivityTarget = { stop: TripDestination; lodging: boolean; activity?: Activity };

/** Preenche o formulário com uma atividade existente (edição). */
function formFrom(a: Activity, lodging: boolean) {
  const n = lodging ? nights(a.durationMinutes) ?? 1 : 1;
  const d = !lodging && a.durationMinutes ? a.durationMinutes : 0;
  return {
    catalogoAtividadeId: a.catalogId != null ? String(a.catalogId) : CUSTOM,
    nome: a.name,
    tipo: lodging ? 'Hospedagem' : normalizeType(a.type) ?? 'Passeio',
    local: a.place ?? '',
    data: a.dateTime ? a.dateTime.slice(0, 10) : '',
    hora: a.dateTime ? a.dateTime.slice(11, 16) : '',
    noites: String(n),
    custoPrevisto: a.estimatedCost != null ? String(a.estimatedCost) : '',
    status: a.status,
    durH: d ? String(Math.floor(d / 60)) : '',
    durM: d ? String(d % 60) : '',
    descricao: a.description ?? '',
  };
}

function ActivityDialog({ tripId, target, onClose }: { tripId: number; target: ActivityTarget | null; onClose: () => void }) {
  const { addActivity, updateActivity } = useTripMutations(tripId);
  const editing = target?.activity ?? null;
  const mutation = editing ? updateActivity : addActivity;
  const stop = target?.stop ?? null;
  const lodging = !!target?.lodging;
  const catalog = useCatalogActivities(stop?.name);
  const blank = { catalogoAtividadeId: CUSTOM, nome: '', tipo: lodging ? 'Hospedagem' : 'Passeio', local: '', data: '', hora: '', noites: '1', custoPrevisto: '', status: 'PENDING', durH: '', durM: '', descricao: '' };
  const [f, setF] = useState(blank);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = fieldErrors(mutation.error);
  const suggestions = (catalog.data ?? []).filter((a) => isLodging(a.type) === lodging && sameCity(a.city, stop?.name));

  useEffect(() => {
    if (!target) return;
    setF(target.activity ? formFrom(target.activity, lodging) : blank);
    addActivity.reset();
    updateActivity.reset();
  }, [target]); // eslint-disable-line react-hooks/exhaustive-deps

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
    const common = {
      nome: f.nome.trim(),
      tipo: lodging ? 'Hospedagem' : f.tipo,
      dataHorario: f.data ? `${f.data}T${f.hora || (lodging ? '14:00' : '09:00')}:00` : null,
      duracaoMinutos: lodging ? n * 1440 : (Number(f.durH) || 0) * 60 + (Number(f.durM) || 0) || null,
      custoPrevisto: f.custoPrevisto ? Number(f.custoPrevisto) : null,
      status: ACTIVITY_STATUS_TO_API[f.status as ActivityStatus],
    };
    if (editing) {
      // PATCH: null não muda; string vazia apaga local e observações. Sem data, o horário fica como estava.
      updateActivity.mutate(
        { id: editing.id, body: { ...common, local: f.local.trim(), descricao: f.descricao.trim(), duracaoMinutos: common.duracaoMinutos ?? 0 } },
        { onSuccess: onClose },
      );
      return;
    }
    addActivity.mutate(
      {
        destinationId: stop.id,
        body: {
          ...common,
          catalogoAtividadeId: f.catalogoAtividadeId ? Number(f.catalogoAtividadeId) : null,
          local: f.local.trim() || null,
          descricao: f.descricao.trim() || null,
        },
      },
      { onSuccess: onClose },
    );
  }

  const what = lodging ? 'hospedagem' : 'atividade';
  return (
    <Dialog open={!!target} onClose={onClose} title={editing ? `Editar ${what}` : stop ? `Nova ${what} em ${stop.name}` : `Nova ${what}`}>
      <form className="form" onSubmit={submit} noValidate>
        {mutation.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(mutation.error, 'editar o roteiro desta viagem')}</Alert>}
        {!editing && suggestions.length > 0 && (
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
        {!lodging && (
          <fieldset className="field" style={{ border: 0, padding: 0, margin: 0 }}>
            <legend className="type-label-md" style={{ marginBottom: 'var(--spacing-xs)' }}>Duração</legend>
            <div className="form-row">
              <Field label="Horas" htmlFor="a-dur-h"><input id="a-dur-h" type="number" inputMode="numeric" min={0} max={23} value={f.durH} onChange={set('durH')} placeholder="0" /></Field>
              <Field label="Minutos" htmlFor="a-dur-m"><input id="a-dur-m" type="number" inputMode="numeric" min={0} max={59} step={5} value={f.durM} onChange={set('durM')} placeholder="0" /></Field>
            </div>
          </fieldset>
        )}
        <Field label="Situação" htmlFor="a-status" helper={lodging ? 'Confirmada = reserva feita.' : 'Confirmada = ingresso comprado ou reserva feita.'}>
          <select id="a-status" value={f.status} onChange={set('status')}>
            {ACTIVITY_STATUSES.map((st) => <option key={st} value={st}>{ACTIVITY_STATUS_META[st].label}</option>)}
          </select>
        </Field>
        <Field label="Observações" htmlFor="a-desc" helper="Opcional: número da reserva, o que levar, ponto de encontro…" error={errs.descricao}>
          <textarea id="a-desc" maxLength={1000} value={f.descricao} onChange={set('descricao')} />
        </Field>
        <Field label={lodging ? 'Custo total da estadia (R$)' : 'Valor previsto (R$)'} htmlFor="a-custo" error={errs.custoPrevisto}>
          <input id="a-custo" type="number" inputMode="decimal" min={0} step="0.01" value={f.custoPrevisto} onChange={set('custoPrevisto')} />
        </Field>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={mutation.isPending} disabled={!f.nome.trim()}>{editing ? 'Salvar' : 'Adicionar'}</Button>
        </div>
      </form>
    </Dialog>
  );
}
