import { useRef, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CaretLeft, CaretRight, MapPin, Star, Users } from '@phosphor-icons/react';
import { rating } from '../lib/format';

export function PhotoCard({ to, photoUrl, alt, title, subtitle, badge, corner }: { to: string; photoUrl: string | null; alt: string; title: string; subtitle?: string; badge?: ReactNode; corner?: ReactNode }) {
  return (
    <Link to={to} className="photo-card">
      {photoUrl ? <img src={photoUrl} alt={alt} loading="lazy" /> : <span className="photo-fallback"><MapPin size={48} aria-hidden /></span>}
      {badge}
      <div className="caption">
        <div style={{ minWidth: 0 }}>
          <p className="type-title-md">{title}</p>
          {subtitle && <p className="type-body-sm sub">{subtitle}</p>}
        </div>
        {corner}
      </div>
    </Link>
  );
}

export const RatingPill = ({ value }: { value: number | null }) => (
  <span className="rating-pill type-label-md" aria-label={`Nota ${rating(value)}`}>
    <Star weight="fill" size={14} aria-hidden /> {rating(value)}
  </span>
);

export const TravelersPill = ({ count }: { count: number }) => (
  <span className="rating-pill type-label-md" aria-label={`${count} viajantes`}>
    <Users weight="fill" size={14} aria-hidden /> {count}
  </span>
);

/** Carrossel com scroll-snap; setas só no desktop (CSS), sempre focáveis por teclado. */
export function Carousel({ label, wide, children }: { label: string; wide?: boolean; children: ReactNode }) {
  const track = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => track.current?.scrollBy({ left: dir * track.current.clientWidth * 0.8, behavior: 'smooth' });
  return (
    <div className="carousel" role="region" aria-label={label}>
      <button type="button" className="carousel-arrow prev" aria-label="Anterior" onClick={() => scroll(-1)}>
        <CaretLeft size={20} aria-hidden />
      </button>
      <ul ref={track} className={`track ${wide ? 'wide' : ''}`}>
        {children}
      </ul>
      <button type="button" className="carousel-arrow next" aria-label="Próximo" onClick={() => scroll(1)}>
        <CaretRight size={20} aria-hidden />
      </button>
    </div>
  );
}
