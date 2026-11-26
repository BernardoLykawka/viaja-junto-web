import { placeCategory } from '../lib/placeCategories';

/** Selo da categoria do destino (Praia, Cidade...), no canto do card de foto. */
export function CategoryBadge({ category }: { category: string | null }) {
  const c = placeCategory(category);
  if (!c) return null;
  return (
    <span className="badge badge-confirmed type-label-sm">
      <c.icon size={14} weight="fill" aria-hidden /> {c.label}
    </span>
  );
}
