import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { isLodging, sameCity } from '../lib/activityTypes';
import { errorMessage } from '../lib/api';
import { money } from '../lib/format';
import { useAddCatalogActivityToTrip, useTripDestinations, useTrips } from '../lib/queries';
import type { CatalogActivity, Place } from '../lib/types';
import { Alert, Button, Dialog, Field } from './ui';

const NEW = 'novo';

/**
 * Adiciona um passeio ou uma hospedagem do catálogo a uma viagem. Hospedagem vira estadia: data de check-in,
 * número de noites (guardado em duracaoMinutos) e custo = preço médio × noites.
 */
export function AddToTripDialog({ open, onClose, place, activity }: { open: boolean; onClose: () => void; place: Place; activity: CatalogActivity }) {
  const lodging = isLodging(activity.type);
  const trips = useTrips();
  const editable = useMemo(() => (trips.data?.data ?? []).filter((t) => t.myRole !== 'VIEWER' && t.status !== 'COMPLETED'), [trips.data]);
  const [tripId, setTripId] = useState('');
  const destinations = useTripDestinations(tripId ? Number(tripId) : undefined);
  const [destId, setDestId] = useState(NEW);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [nightsCount, setNightsCount] = useState('1');
  const [cost, setCost] = useState('');
  const add = useAddCatalogActivityToTrip();
  const trip = editable.find((t) => String(t.id) === tripId);

  useEffect(() => {
    if (!open) return;
    setTripId(editable[0] ? String(editable[0].id) : '');
    setDate('');
    setTime('');
    setNightsCount('1');
    setCost(activity.averagePrice != null ? String(activity.averagePrice) : '');
    add.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editable.length]);

  // Destino da viagem que corresponde a este lugar: pelo vínculo com o catálogo ou pelo nome da cidade.
  useEffect(() => {
    const match = destinations.data?.find((d) => d.catalogId === place.id || sameCity(d.name, place.name) || sameCity(d.name, place.city));
    setDestId(match ? String(match.id) : NEW);
  }, [destinations.data, place]);

  useEffect(() => {
    if (lodging && activity.averagePrice != null) setCost(String(Math.round(activity.averagePrice * Math.max(1, Number(nightsCount) || 1) * 100) / 100));
  }, [nightsCount, lodging, activity.averagePrice]);

  const outOfTrip = date && trip?.startDate && trip.endDate && (date < trip.startDate || date > trip.endDate);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!tripId) return;
    const n = Math.max(1, Number(nightsCount) || 1);
    add.mutate(
      {
        tripId: Number(tripId),
        destinationId: destId === NEW ? null : Number(destId),
        place: { id: place.id, name: place.name },
        activity: {
          catalogoAtividadeId: activity.id,
          nome: activity.name,
          tipo: activity.type,
          dataHorario: date ? `${date}T${time || (lodging ? '14:00' : '09:00')}:00` : null,
          duracaoMinutos: lodging ? n * 1440 : null,
          custoPrevisto: cost ? Number(cost) : null,
        },
      },
      { onSuccess: () => undefined },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title={lodging ? 'Reservar na viagem' : 'Adicionar à viagem'}>
      {add.isSuccess ? (
        <div className="stack">
          <Alert kind="success">{activity.name} foi adicionado ao roteiro de {trip?.name}.</Alert>
          <div className="form-actions">
            <Button variant="secondary" onClick={onClose}>Continuar explorando</Button>
            <Link className="button button-primary type-label-lg" to={`/viagens/${tripId}`}>Abrir roteiro</Link>
          </div>
        </div>
      ) : trips.isLoading ? (
        <p className="type-body-md muted" role="status">Carregando suas viagens…</p>
      ) : editable.length === 0 ? (
        <Alert kind="info">Você não tem viagens em que possa editar o roteiro. Crie uma viagem no painel e volte aqui.</Alert>
      ) : (
        <form className="form" onSubmit={submit} noValidate>
          {add.error && <Alert kind="error">{errorMessage(add.error, 'editar o roteiro desta viagem')}</Alert>}
          <p className="type-body-md">
            <strong>{activity.name}</strong>
            {activity.averagePrice != null && <span className="muted"> · {money(activity.averagePrice)}{lodging ? ' por noite (preço médio)' : ' (preço médio)'}</span>}
          </p>
          <Field label="Viagem" htmlFor="at-trip">
            <select id="at-trip" value={tripId} onChange={(e) => setTripId(e.target.value)}>
              {editable.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </Field>
          <Field label="Destino no roteiro" htmlFor="at-dest" helper={destId === NEW ? `${place.name} ainda não está no roteiro desta viagem; vamos adicioná-lo.` : undefined}>
            <select id="at-dest" value={destId} onChange={(e) => setDestId(e.target.value)}>
              <option value={NEW}>Adicionar {place.name} ao roteiro</option>
              {destinations.data?.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </Field>
          <div className="form-row">
            <Field label={lodging ? 'Check-in' : 'Data'} htmlFor="at-date" error={outOfTrip ? 'Essa data fica fora das datas da viagem.' : undefined}>
              <input id="at-date" type="date" value={date} min={trip?.startDate ?? undefined} max={trip?.endDate ?? undefined} onChange={(e) => setDate(e.target.value)} />
            </Field>
            {lodging ? (
              <Field label="Noites" htmlFor="at-nights">
                <input id="at-nights" type="number" inputMode="numeric" min={1} max={60} value={nightsCount} onChange={(e) => setNightsCount(e.target.value)} />
              </Field>
            ) : (
              <Field label="Horário" htmlFor="at-time">
                <input id="at-time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </Field>
            )}
          </div>
          <Field label={lodging ? 'Custo total da estadia (R$)' : 'Valor previsto (R$)'} htmlFor="at-cost">
            <input id="at-cost" type="number" inputMode="decimal" min={0} step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} />
          </Field>
          <div className="form-actions">
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button type="submit" busy={add.isPending} disabled={!tripId}>{lodging ? 'Adicionar estadia' : 'Adicionar ao roteiro'}</Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
