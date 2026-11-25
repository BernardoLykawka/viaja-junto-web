import { Link } from 'react-router-dom';
import { Star } from '@phosphor-icons/react';
import { categoryIcon, normalizeType } from '../lib/activityTypes';
import { price, rating } from '../lib/format';
import type { CatalogActivity } from '../lib/types';

/** Card de foto de uma atividade do catálogo (passeio, restaurante, hotel...). */
export function CatalogActivityCard({ placeId, a }: { placeId: number; a: CatalogActivity }) {
  const I = categoryIcon(a.type);
  const lodging = normalizeType(a.type) === 'Hospedagem';
  return (
    <Link to={`/destinos/${placeId}/atividades/${a.id}`} className="photo-card">
      {a.photoUrl ? <img src={a.photoUrl} alt={`Foto de ${a.name}`} loading="lazy" /> : <span className="photo-fallback"><I size={48} aria-hidden /></span>}
      <span className="badge badge-confirmed type-label-sm"><I size={14} weight="fill" aria-hidden /> {normalizeType(a.type) ?? a.type ?? 'Atividade'}</span>
      <div className="caption">
        <div style={{ minWidth: 0 }}>
          <p className="type-title-md">{a.name}</p>
          <p className="type-body-sm sub">
            {a.averagePrice != null ? `${price(a.averagePrice)}${lodging && a.averagePrice > 0 ? ' / noite' : ''}` : a.location}
          </p>
        </div>
        <span className="rating-pill type-label-md" aria-label={`Nota ${rating(a.averageRating)}`}>
          <Star weight="fill" size={14} aria-hidden /> {rating(a.averageRating)}
        </span>
      </div>
    </Link>
  );
}
