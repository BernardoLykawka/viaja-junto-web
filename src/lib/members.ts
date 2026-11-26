import type { Member, Trip, User } from './types';

/**
 * O backend guarda quem criou a viagem só em `criador`: ele não aparece em /trips/{id}/members nem em
 * `membros`. Aqui o dono entra no topo da lista (uma vez só, mesmo que o backend passe a incluí-lo).
 * O id negativo marca a linha como sintética: ela não tem membroId para alterar ou remover.
 */
export function withOwner(owner: User | null | undefined, members: Member[]): Member[] {
  if (!owner?.id) return members;
  const listed = members.find((m) => m.user.id === owner.id);
  return [{ id: listed?.id ?? -owner.id, user: listed?.user ?? owner, role: 'OWNER' }, ...members.filter((m) => m.user.id !== owner.id)];
}

/** Todas as pessoas da viagem (dono + membros), para avatares e contagem de viajantes. */
export const tripPeople = (trip: Trip) => withOwner(trip.owner, trip.members);
