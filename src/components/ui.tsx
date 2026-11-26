import { forwardRef, useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { ArrowRight, CheckCircle, CircleNotch, FlagCheckered, Info, Warning, WarningCircle, X, type Icon } from '@phosphor-icons/react';
import { initials } from '../lib/format';
import type { TripStatus } from '../lib/types';

export const STATUS_META: Record<TripStatus, { label: string; badge: string; icon: Icon }> = {
  PLANNING: { label: 'Planejando', badge: 'badge-planning', icon: CircleNotch },
  CONFIRMED: { label: 'Confirmada', badge: 'badge-confirmed', icon: CheckCircle },
  COMPLETED: { label: 'Concluída', badge: 'badge-completed', icon: FlagCheckered },
};

export function StatusBadge({ status }: { status: TripStatus }) {
  const { label, badge, icon: I } = STATUS_META[status];
  return (
    <span className={`badge ${badge} type-label-sm`}>
      <I weight="fill" size={14} aria-hidden /> {label}
    </span>
  );
}

type BtnProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'compact' | 'danger'; icon?: Icon; busy?: boolean };
export const Button = forwardRef<HTMLButtonElement, BtnProps>(function Button({ variant = 'primary', icon: I, busy, children, className = '', disabled, ...rest }, ref) {
  return (
    <button ref={ref} type="button" className={`button button-${variant} type-label-lg ${className}`} disabled={disabled || busy} style={disabled || busy ? { opacity: 0.4, cursor: 'default' } : undefined} {...rest}>
      {I && <I size={20} aria-hidden />}
      {busy ? 'Aguarde…' : children}
    </button>
  );
});

export function PillButton({ children, ...rest }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type="button" className="button-pill type-label-lg" {...rest}>
      {children}
      <span className="pill-icon">
        <ArrowRight size={20} aria-hidden />
      </span>
    </button>
  );
}

/** Foto do usuário (a do Google, via avatarUrl) com as iniciais como reserva se não houver ou não carregar. */
export function Avatar({ name, src, size = 'md' }: { name: string; src?: string | null; size?: 'sm' | 'md' }) {
  const [broken, setBroken] = useState(false);
  const cls = `avatar ${size === 'sm' ? 'sm' : ''} type-label-md`;
  if (src && !broken) {
    return <img className={`${cls} avatar-img`} src={src} alt={name} title={name} referrerPolicy="no-referrer" onError={() => setBroken(true)} />;
  }
  return (
    <span className={cls} title={name} role="img" aria-label={name}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ people, max = 4 }: { people: { name: string; avatarUrl?: string | null }[]; max?: number }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="avatar-stack">
      {shown.map((p, i) => (
        <Avatar key={`${p.name}-${i}`} name={p.name} src={p.avatarUrl} size="sm" />
      ))}
      {extra > 0 && (
        <span className="avatar sm type-label-md" aria-label={`mais ${extra} pessoas`}>
          +{extra}
        </span>
      )}
    </div>
  );
}

const ALERT_ICON = { success: CheckCircle, warning: Warning, error: WarningCircle, info: Info };
export function Alert({ kind = 'info', children, action }: { kind?: keyof typeof ALERT_ICON; children: ReactNode; action?: ReactNode }) {
  const I = ALERT_ICON[kind];
  return (
    <div className={`alert alert-${kind} type-body-sm`} role={kind === 'error' ? 'alert' : 'status'}>
      <I weight="fill" size={20} aria-hidden />
      <div style={{ flex: 1 }}>{children}</div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: I, text, action }: { icon: Icon; text: string; action?: ReactNode }) {
  return (
    <div className="empty">
      <I size={48} aria-hidden style={{ color: 'var(--color-primary)' }} />
      <p className="type-body-md muted" style={{ maxWidth: '36ch' }}>
        {text}
      </p>
      {action}
    </div>
  );
}

export function Skeleton({ className = '', style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`skeleton ${className}`} style={style} aria-hidden />;
}

/** Diálogo nativo (<dialog>): foco preso, Esc fecha e leitores de tela entendem sem trabalho extra. */
export function Dialog({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return (
    <dialog ref={ref} className="dialog" onClose={onClose} onClick={(e) => e.target === ref.current && onClose()} aria-labelledby="dialog-title">
      {open && (
        <div className="dialog-body">
          <div className="section-head" style={{ marginBottom: 'var(--spacing-md)' }}>
            <h2 id="dialog-title" className="type-headline-sm card-title">
              {title}
            </h2>
            <button type="button" className="icon-button" aria-label="Fechar" onClick={onClose}>
              <X size={24} aria-hidden />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  );
}

export function Field({ label, error, helper, children, htmlFor }: { label: string; error?: string; helper?: string; children: ReactNode; htmlFor: string }) {
  return (
    <div className="field">
      <label htmlFor={htmlFor} className="type-label-md">
        {label}
      </label>
      {children}
      {error ? (
        <p className="type-body-sm field-error" id={`${htmlFor}-msg`}>
          <WarningCircle weight="fill" size={16} aria-hidden /> {error}
        </p>
      ) : helper ? (
        <p className="type-body-sm muted" id={`${htmlFor}-msg`}>
          {helper}
        </p>
      ) : null}
    </div>
  );
}

/** "Carregar mais" de listas paginadas; some quando não há próxima página. */
export function LoadMore({ hasMore, loading, onClick, label = 'Carregar mais' }: { hasMore: boolean; loading: boolean; onClick: () => void; label?: string }) {
  if (!hasMore) return null;
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginTop: 'var(--spacing-lg)' }}>
      <Button variant="secondary" busy={loading} onClick={onClick}>{label}</Button>
    </div>
  );
}

/** Carregamento de página: barra fina no topo (não cobre a logo no Início) e texto só para leitor de tela. */
export function RouteLoading() {
  return (
    <div className="route-loading" role="status">
      <span className="sr-only">Carregando…</span>
    </div>
  );
}
