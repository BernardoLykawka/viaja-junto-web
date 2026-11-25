import { Bank, Bed, Bus, ForkKnife, MapPin, Ticket, type Icon } from '@phosphor-icons/react';

/**
 * Tipos de atividade usados pelo backend (CatalogoAtividadeEntity.tipo). Hospedagem também é uma atividade:
 * fica dentro do destino, tem preço e avaliação, mas no roteiro aparece como estadia (check-in + noites).
 */
export const ACTIVITY_TYPES = ['Passeio', 'Cultura', 'Gastronomia', 'Hospedagem', 'Transporte'] as const;
export type ActivityType = (typeof ACTIVITY_TYPES)[number];

const ICONS: Record<ActivityType, Icon> = { Passeio: Ticket, Cultura: Bank, Gastronomia: ForkKnife, Hospedagem: Bed, Transporte: Bus };

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

/** Aceita variações antigas ("Comida", "hotel"...) para não quebrar atividades já cadastradas. */
export function normalizeType(type: string | null | undefined): ActivityType | null {
  if (!type) return null;
  const t = norm(type);
  const exact = ACTIVITY_TYPES.find((x) => norm(x) === t);
  if (exact) return exact;
  if (/comid|aliment|restaur|jantar|almoco/.test(t)) return 'Gastronomia';
  if (/hosped|hotel|pousada|hostel|airbnb|estadia/.test(t)) return 'Hospedagem';
  if (/transp|voo|trem|onibus|carro|transfer/.test(t)) return 'Transporte';
  if (/museu|cultur|teatro|igreja/.test(t)) return 'Cultura';
  if (/passeio|tour|ingresso|atra/.test(t)) return 'Passeio';
  return null;
}

export const isLodging = (type: string | null | undefined) => normalizeType(type) === 'Hospedagem';
export const categoryIcon = (type: string | null | undefined): Icon => ICONS[normalizeType(type) ?? 'Passeio'] ?? MapPin;

/** Compara nomes de cidade sem acento e sem caixa ("Tóquio" = "toquio"). */
export const sameCity = (a: string | null | undefined, b: string | null | undefined) => !!a && !!b && norm(a) === norm(b);

export const nights = (durationMinutes: number | null | undefined) => (durationMinutes ? Math.max(1, Math.round(durationMinutes / 1440)) : null);
