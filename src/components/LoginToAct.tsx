import { Link, useLocation } from 'react-router-dom';
import { GoogleLogo } from '@phosphor-icons/react';
import { useAuth } from '../lib/auth';

/** Mostra a ação (avaliar, adicionar à viagem) só com sessão; sem login, um convite para entrar. */
export function LoginToAct({ children, text }: { children: React.ReactNode; text: string }) {
  const { status } = useAuth();
  const { pathname } = useLocation();
  if (status === 'authed') return <>{children}</>;
  if (status === 'loading') return null;
  return (
    <section className="card stack-sm">
      <p className="type-body-md">{text}</p>
      <Link to="/entrar" state={{ from: pathname }} className="button button-secondary type-label-lg"><GoogleLogo size={20} aria-hidden /> Entrar com Google</Link>
    </section>
  );
}
