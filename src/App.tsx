import { lazy, Suspense, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';

// Cada página é baixada só quando aberta: o pacote inicial fica com o essencial (layout, login, auth).
const page = <K extends string>(load: () => Promise<Record<K, React.ComponentType>>, name: K) =>
  lazy(() => load().then((m) => ({ default: m[name] })));
const Painel = page(() => import('./pages/Painel'), 'Painel');
const MinhasViagens = page(() => import('./pages/MinhasViagens'), 'MinhasViagens');
const Viagem = page(() => import('./pages/Viagem'), 'Viagem');
const Descobrir = page(() => import('./pages/Descobrir'), 'Descobrir');
const Perfil = page(() => import('./pages/Perfil'), 'Perfil');
const Destino = page(() => import('./pages/Destino'), 'Destino');
const Convite = page(() => import('./pages/Convite'), 'Convite');
const Atividade = page(() => import('./pages/Atividade'), 'Atividade');
const NaoEncontrada = page(() => import('./pages/NaoEncontrada'), 'NaoEncontrada');

const Loading = () => <p className="type-body-md muted container page-work" role="status">Carregando…</p>;

/** Rotas do usuário: sem sessão, vai para o login e volta para cá depois. */
export function Protected({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const loc = useLocation();
  if (status === 'loading') return <Loading />;
  if (status === 'anon') return <Navigate to="/entrar" replace state={{ from: loc.pathname + loc.search + loc.hash }} />;
  return <>{children}</>;
}

export function App() {
  return (
    <Suspense fallback={<Loading />}>
      <Routes>
        <Route path="/entrar" element={<Login />} />
        <Route element={<Layout />}>
          {/* Públicas: o Início e o catálogo de destinos e atividades não exigem login. */}
          <Route path="/" element={<Painel />} />
          <Route path="/descobrir" element={<Descobrir />} />
          <Route path="/destinos/:id" element={<Destino />} />
          <Route path="/destinos/:id/atividades/:activityId" element={<Atividade />} />
          <Route path="/atividades/:activityId" element={<Atividade />} />
          {/* Do usuário: exigem login com Google. */}
          <Route path="/viagens" element={<Protected><MinhasViagens /></Protected>} />
          <Route path="/viagens/:id" element={<Protected><Viagem /></Protected>} />
          <Route path="/perfil" element={<Protected><Perfil /></Protected>} />
          <Route path="/convite/:id" element={<Protected><Convite /></Protected>} />
          <Route path="*" element={<NaoEncontrada />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
