import { useEffect, useState, type FormEvent } from 'react';
import { errorMessage, fieldErrors } from '../lib/api';
import { useUpdateTrip } from '../lib/queries';
import type { Trip, TripStatus } from '../lib/types';
import { Alert, Button, Dialog, Field, STATUS_META } from './ui';

export function EditarViagemDialog({ trip, open, onClose }: { trip: Trip; open: boolean; onClose: () => void }) {
  const update = useUpdateTrip(trip.id);
  const [f, setF] = useState({ name: '', description: '', startDate: '', endDate: '', status: trip.status });

  useEffect(() => {
    if (!open) return;
    setF({ name: trip.name, description: trip.description ?? '', startDate: trip.startDate ?? '', endDate: trip.endDate ?? '', status: trip.status });
    update.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((p) => ({ ...p, [k]: e.target.value }));
  const errs = fieldErrors(update.error);
  const badDates = f.startDate && f.endDate && f.endDate < f.startDate ? 'A volta precisa ser depois da ida.' : undefined;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (badDates) return;
    update.mutate(
      { name: f.name.trim(), description: f.description.trim() || null, startDate: f.startDate || null, endDate: f.endDate || null, status: f.status as TripStatus },
      { onSuccess: onClose },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Editar viagem">
      <form className="form" onSubmit={submit} noValidate>
        {update.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(update.error, 'editar esta viagem')}</Alert>}
        <Field label="Nome da viagem" htmlFor="ev-nome" error={errs.nome}>
          <input id="ev-nome" required minLength={2} maxLength={150} value={f.name} onChange={set('name')} />
        </Field>
        <Field label="Descrição" htmlFor="ev-desc" error={errs.descricao} helper="Opcional. Até 1000 caracteres.">
          <textarea id="ev-desc" maxLength={1000} value={f.description} onChange={set('description')} />
        </Field>
        <div className="form-row">
          <Field label="Ida" htmlFor="ev-ida" error={errs.dataInicio}>
            <input id="ev-ida" type="date" value={f.startDate} onChange={set('startDate')} />
          </Field>
          <Field label="Volta" htmlFor="ev-volta" error={badDates ?? errs.dataFim}>
            <input id="ev-volta" type="date" min={f.startDate || undefined} value={f.endDate} onChange={set('endDate')} />
          </Field>
        </div>
        <Field label="Situação" htmlFor="ev-status" error={errs.status}>
          <select id="ev-status" value={f.status} onChange={set('status')}>
            {(Object.keys(STATUS_META) as TripStatus[]).map((s) => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
        </Field>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={update.isPending} disabled={f.name.trim().length < 2}>Salvar</Button>
        </div>
      </form>
    </Dialog>
  );
}
