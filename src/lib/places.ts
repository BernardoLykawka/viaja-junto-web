import type { Place } from './types';

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Texto da sugestão do catálogo: "Rio de Janeiro, Brasil". */
export const placeLabel = (p: Place) => `${p.name}, ${p.country}`;

/** Acha o destino do catálogo que a pessoa escolheu ou digitou ("rio de janeiro", "Rio de Janeiro, Brasil", "Tóquio"). */
export function matchPlace(places: Place[], text: string): Place | null {
  const t = norm(text);
  if (!t) return null;
  return places.find((p) => norm(placeLabel(p)) === t || norm(p.name) === t || (!!p.city && norm(p.city) === t)) ?? null;
}
