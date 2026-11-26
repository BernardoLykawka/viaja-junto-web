import { Crown, Eye, PencilSimple, Trash } from '@phosphor-icons/react';
import { errorMessage } from '../lib/api';
import { useMembers, useTripMutations } from '../lib/queries';
import type { Role, Trip } from '../lib/types';
import { Alert, Avatar, Button, Skeleton } from './ui';
import { inviteLink } from '../lib/invite';

export const ROLE_META: Record<Role, { label: string; icon: typeof Crown }> = {
  OWNER: { label: 'Dono(a)', icon: Crown },
  EDITOR: { label: 'Editor(a)', icon: PencilSimple },
  VIEWER: { label: 'Visualizador(a)', icon: Eye },
};

export function MembrosTab({ trip, meId }: { trip: Trip; meId: number | undefined }) {
  const { data, isLoading, error } = useMembers(trip.id);
  const { setRole, removeMember } = useTripMutations(trip.id);
  const isOwner = trip.myRole === 'OWNER';
  const mutError = setRole.error ?? removeMember.error;

  return (
    <section aria-labelledby="mem-h" className="stack">
      <h2 id="mem-h" className="type-headline-sm card-title">Membros</h2>
      {(error || mutError) && <Alert kind="error">{errorMessage(error ?? mutError, 'gerenciar os membros desta viagem')}</Alert>}
      {isLoading ? <Skeleton style={{ height: 160 }} /> : (
        <div className="card">
          <ul className="list">
            {data?.map((m) => {
              const meta = ROLE_META[m.role];
              const canManage = isOwner && m.role !== 'OWNER' && m.user.id !== meId;
              return (
                <li key={m.id}>
                  <Avatar name={m.user.name} src={m.user.avatarUrl} />
                  <div className="grow">
                    <p className="type-title-md">{m.user.name}{m.user.id === meId ? ' (você)' : ''}</p>
                    <p className="type-body-sm muted">{m.user.email}</p>
                  </div>
                  {canManage ? (
                    <>
                      <label className="sr-only" htmlFor={`perm-${m.id}`}>Permissão de {m.user.name}</label>
                      <select id={`perm-${m.id}`} className="select" value={m.role} onChange={(e) => setRole.mutate({ memberId: m.id, role: e.target.value as Role })}>
                        <option value="EDITOR">Editor(a)</option>
                        <option value="VIEWER">Visualizador(a)</option>
                      </select>
                      <Button variant="compact" icon={Trash} aria-label={`Remover ${m.user.name}`} onClick={() => window.confirm(`Remover ${m.user.name} da viagem?`) && removeMember.mutate(m.id)} />
                    </>
                  ) : (
                    <span className="chip static type-label-md"><meta.icon size={16} aria-hidden /> {meta.label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
      {isOwner && trip.inviteCode && (
        <Alert kind="info">Para convidar alguém, envie o link de convite: <strong className="type-numeric-md" style={{ wordBreak: 'break-all' }}>{inviteLink(trip.id, trip.inviteCode)}</strong>. Quem abrir o link entra como editor(a); depois você pode mudar a permissão aqui.</Alert>
      )}
    </section>
  );
}
