import { useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { AirplaneTilt, Compass, GlobeHemisphereWest, SignOut, UserCircle } from '@phosphor-icons/react';
import { useAuth } from '../lib/auth';
import { useMe } from '../lib/queries';
import { Avatar } from './ui';

const NAV = [
  { to: '/viagens', label: 'Minhas viagens' },
  { to: '/descobrir', label: 'Descobrir' },
];

/** Recortes orgânicos da foto do hero (DESIGN.md › Shapes). Ficam no DOM uma vez só. */
function ClipPaths() {
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
      <clipPath id="hero-photo" clipPathUnits="objectBoundingBox">
        <path d="M0.40,0 H1 V0.88 C0.90,0.83 0.80,0.86 0.70,0.93 C0.58,1.01 0.42,1.00 0.30,0.92 C0.18,0.84 0.20,0.70 0.12,0.60 C0.04,0.50 0.02,0.38 0.10,0.24 C0.18,0.10 0.30,0.06 0.40,0 Z" />
      </clipPath>
      <clipPath id="hero-photo-mobile" clipPathUnits="objectBoundingBox">
        <path d="M0,0 H1 V0.86 C0.80,0.80 0.62,0.96 0.40,0.98 C0.24,1.00 0.10,0.94 0,0.88 Z" />
      </clipPath>
      <clipPath id="hero-shape" clipPathUnits="objectBoundingBox">
        <path d="M0.32,0 H1 V0.97 C0.86,1.00 0.74,0.97 0.62,0.99 C0.44,1.02 0.26,0.98 0.16,0.86 C0.06,0.74 0.10,0.60 0.04,0.46 C-0.02,0.32 0.10,0.14 0.32,0 Z" />
      </clipPath>
    </svg>
  );
}

export function Layout() {
  const { pathname } = useLocation();
  const { signOut, status } = useAuth();
  const { data: me } = useMe();
  const main = useRef<HTMLElement>(null);
  const discovery = pathname === '/viagens';

  useEffect(() => {
    document.body.classList.toggle('discovery', discovery);
    return () => document.body.classList.remove('discovery');
  }, [discovery]);

  // A cada troca de rota o foco vai para o conteúdo (leitor de tela e teclado).
  useEffect(() => {
    main.current?.focus({ preventScroll: true });
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <>
      <a href="#conteudo" className="sr-only">
        Pular para o conteúdo
      </a>
      <header className="app-bar">
        <div className="container">
          <Link className="brand" to="/viagens">
            <span className="brand-mark">
              <Compass weight="fill" size={24} aria-hidden />
            </span>
            <span>
              <span className="type-headline-sm">ViajaJunto</span>
              <span className="brand-tagline type-body-sm">Viagens em grupo</span>
            </span>
          </Link>
          <nav className="top-nav" aria-label="Principal">
            {NAV.map((n) => (
              <NavLink key={n.to} to={n.to} className="nav-item type-label-lg" end>
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="bar-actions">
            {status === 'loading' ? null : status === 'anon' ? (
              <Link to="/entrar" state={{ from: pathname }} className="button button-secondary type-label-md login-link">Entrar</Link>
            ) : (<>
            <Link to="/perfil" aria-label={me ? `Perfil de ${me.name}` : 'Perfil'} style={{ display: 'inline-flex' }}>
              {me ? <Avatar name={me.name} /> : <UserCircle size={40} aria-hidden />}
            </Link>
            <button type="button" className="icon-button button-circle top-signout" aria-label="Sair" onClick={() => void signOut()}>
              <SignOut size={24} aria-hidden />
            </button>
            </>)}
          </div>
        </div>
      </header>
      <ClipPaths />
      <main id="conteudo" ref={main} tabIndex={-1} style={{ paddingBottom: 'var(--spacing-4xl)' }} className="app-main">
        <Outlet />
      </main>
      <nav className="bottom-nav type-label-sm" aria-label="Principal (celular)">
        <NavLink to="/viagens" end>
          <AirplaneTilt size={24} aria-hidden />
          Viagens
        </NavLink>
        <NavLink to="/descobrir" end>
          <GlobeHemisphereWest size={24} aria-hidden />
          Descobrir
        </NavLink>
        <NavLink to={status === 'anon' ? '/entrar' : '/perfil'} end>
          <UserCircle size={24} aria-hidden />
          {status === 'anon' ? 'Entrar' : 'Perfil'}
        </NavLink>
      </nav>
    </>
  );
}
