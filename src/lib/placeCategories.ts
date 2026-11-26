import { Bank, Buildings, MapPin, Mountains, Snowflake, Tree, TreePalm, type Icon } from '@phosphor-icons/react';

/**
 * Categorias de destino (DestinoCatalogoEntity.categoria, texto livre no backend). A API filtra por
 * `GET /places?categoria=` comparando sem diferenciar maiúsculas; aqui ficam o rótulo e o ícone de cada uma.
 * Categoria que o backend mandar e não estiver na lista aparece com o próprio texto e o ícone de alfinete.
 */
export const PLACE_CATEGORIES: { id: string; label: string; icon: Icon }[] = [
  { id: 'praia', label: 'Praia', icon: TreePalm },
  { id: 'cidade', label: 'Cidade', icon: Buildings },
  { id: 'natureza', label: 'Natureza', icon: Tree },
  { id: 'cultural', label: 'Cultural', icon: Bank },
  { id: 'montanha', label: 'Montanha', icon: Mountains },
  { id: 'neve', label: 'Neve', icon: Snowflake },
];

const key = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

export function placeCategory(id: string | null | undefined): { id: string; label: string; icon: Icon } | null {
  if (!id) return null;
  const k = key(id);
  return PLACE_CATEGORIES.find((c) => c.id === k) ?? { id: k, label: id.charAt(0).toUpperCase() + id.slice(1), icon: MapPin };
}
