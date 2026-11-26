/** Link de convite que o dono compartilha. A rota /convite/:id faz o POST /trips/{id}/members/join. */
export const inviteLink = (tripId: number, code: string) =>
  `${window.location.origin}/convite/${tripId}?codigo=${encodeURIComponent(code)}`;

/**
 * Lê o que a pessoa colou: o link inteiro (.../convite/12?codigo=ABC) ou só o código ("ABC").
 * Sem link não há id da viagem; o backend procura a viagem pelo código e ignora o id do caminho
 * (MembroViagemService.joinViagemByCode), então usamos 0.
 */
export function parseInvite(input: string): { tripId: number; code: string } | null {
  const text = input.trim();
  if (!text) return null;
  const link = text.match(/\/convite\/(\d+)\?(?:.*&)?codigo=([^&#\s]+)/);
  if (link) return { tripId: Number(link[1]), code: decodeURIComponent(link[2]!) };
  if (/^[\w-]{4,64}$/.test(text)) return { tripId: 0, code: text };
  return null;
}
