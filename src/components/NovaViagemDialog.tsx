import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { errorMessage, fieldErrors } from '../lib/api';
import { useCreateTrip } from '../lib/queries';
import { Alert, Button, Dialog, Field } from './ui';
import type { Place } from '../lib/types';

export interface TripDraft {
  name?: string;
  start?: string;
  end?: string;
  /** Destino do catálogo escolhido na busca: entra no roteiro assim que a viagem é criada. */
  place?: Place;
}

export function NovaViagemDialog({ open, onClose, draft }: { open: boolean; onClose: () => void; draft?: TripDraft }) {
  const navigate = useNavigate();
  const create = useCreateTrip();
  const [name, setName] = useState('');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [budget, setBudget] = useState('');

  useEffect(() => {
    if (open) {
      setName(draft?.name ?? '');
      setStart(draft?.start ?? '');
      setEnd(draft?.end ?? '');
      setBudget('');
      create.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const errs = fieldErrors(create.error);
  const dateOrder = start && end && end < start ? 'A volta precisa ser depois da ida.' : undefined;

  function submit(e: FormEvent) {
    e.preventDefault();
    if (dateOrder) return;
    create.mutate(
      {
        trip: { nome: name.trim(), dataInicio: start || null, dataFim: end || null, orcamentoTotal: budget ? Number(budget) : null },
        place: draft?.place ? { destinoCatalogoId: draft.place.id, nome: draft.place.name, dataChegada: start || null, dataSaida: end || null } : undefined,
      },
      {
        onSuccess: (trip) => {
          onClose();
          navigate(`/viagens/${trip.id}`);
        },
      },
    );
  }

  return (
    <Dialog open={open} onClose={onClose} title="Nova viagem">
      <form className="form" onSubmit={submit} noValidate>
        {create.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(create.error, 'criar viagens')}</Alert>}
        <Field label="Nome da viagem" htmlFor="nv-nome" error={errs.nome ?? errs.title}>
          <input id="nv-nome" required minLength={2} maxLength={150} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex.: Eurotrip 2027" aria-describedby="nv-nome-msg" />
        </Field>
        <div className="form-row">
          <Field label="Ida" htmlFor="nv-ida" error={errs.dataInicio}>
            <input id="nv-ida" type="date" value={start} onChange={(e) => setStart(e.target.value)} />
          </Field>
          <Field label="Volta" htmlFor="nv-volta" error={dateOrder ?? errs.dataFim}>
            <input id="nv-volta" type="date" value={end} min={start || undefined} onChange={(e) => setEnd(e.target.value)} />
          </Field>
        </div>
        <Field label="Orçamento total (R$)" htmlFor="nv-orc" helper="Opcional. Você pode ajustar depois na aba Orçamento." error={errs.orcamentoTotal}>
          <input id="nv-orc" type="number" inputMode="decimal" min={0} step="0.01" value={budget} onChange={(e) => setBudget(e.target.value)} />
        </Field>
        {draft?.place && <Alert kind="info">{draft.place.name} já entra no roteiro como primeiro destino.</Alert>}
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={create.isPending} disabled={name.trim().length < 2}>Criar viagem</Button>
        </div>
      </form>
    </Dialog>
  );
}
