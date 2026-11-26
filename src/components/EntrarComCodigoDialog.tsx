import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ApiError, errorMessage } from '../lib/api';
import { parseInvite } from '../lib/invite';
import { useJoinTrip } from '../lib/queries';
import type { Page, Trip } from '../lib/types';
import { Alert, Button, Dialog, Field } from './ui';

/** Entrar numa viagem colando o código ou o link de convite. */
export function EntrarComCodigoDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const join = useJoinTrip();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const [text, setText] = useState('');
  const invite = parseInvite(text);

  useEffect(() => { if (open) { setText(''); join.reset(); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  /** Depois de entrar, abre a viagem: pelo id do link ou procurando a viagem com esse código. */
  async function openTrip(tripId: number, code: string) {
    if (tripId) return navigate(`/viagens/${tripId}`);
    await qc.refetchQueries({ queryKey: ['trips'] });
    const trips = qc.getQueryData<Page<Trip>>(['trips'])?.data ?? [];
    const found = trips.find((t) => t.inviteCode === code);
    onClose();
    if (found) navigate(`/viagens/${found.id}`);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!invite) return;
    join.mutate(invite, {
      onSuccess: () => void openTrip(invite.tripId, invite.code),
      onError: (err) => {
        // Já fazia parte: só abre a viagem.
        if (err instanceof ApiError && /já é (membro|o criador)/i.test(err.message)) void openTrip(invite.tripId, invite.code);
      },
    });
  }

  const error = join.error instanceof ApiError && join.error.status < 500 ? join.error.message : join.error ? errorMessage(join.error) : null;
  return (
    <Dialog open={open} onClose={onClose} title="Entrar com código">
      <form className="form" onSubmit={submit} noValidate>
        {error && <Alert kind="error">{error}</Alert>}
        <Field label="Código ou link de convite" htmlFor="ec-codigo" helper="Peça para quem criou a viagem copiar o link no topo dela." error={text && !invite ? 'Cole o código (ex.: EUR2026CODE1) ou o link inteiro.' : undefined}>
          <input id="ec-codigo" value={text} onChange={(e) => setText(e.target.value)} autoComplete="off" spellCheck={false} autoFocus />
        </Field>
        <div className="form-actions">
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button type="submit" busy={join.isPending} disabled={!invite}>Entrar na viagem</Button>
        </div>
      </form>
    </Dialog>
  );
}
