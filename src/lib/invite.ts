/** Link de convite que o dono compartilha. A rota /convite/:id faz o POST /trips/{id}/members/join. */
export const inviteLink = (tripId: number, code: string) =>
  `${window.location.origin}/convite/${tripId}?codigo=${encodeURIComponent(code)}`;
