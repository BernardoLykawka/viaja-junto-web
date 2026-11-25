import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Painel } from './pages/Painel';
import { Viagem } from './pages/Viagem';
import { Descobrir } from './pages/Descobrir';
import { Perfil } from './pages/Perfil';
import { Destino } from './pages/Destino';
import { Convite } from './pages/Convite';
import { Atividade } from './pages/Atividade';

function Protected({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();
  const loc = useLocation();
  if (status === 'loading') return <p className="type-body-md muted" style={{ padding: 'var(--spacing-xl)' }} role="status">Carregando…</p>;
  if (status === 'anon') return <Navigate to="/entrar" replace state={{ from: loc.pathname + loc.search }} />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/entrar" element={<Login />} />
      <Route element={<Layout />}>
        {/* Públicas: o catálogo de destinos e atividades não exige login na API. */}
        <Route path="/descobrir" element={<Descobrir />} />
        <Route path="/destinos/:id" element={<Destino />} />
        <Route path="/destinos/:id/atividades/:activityId" element={<Atividade />} />
        {/* Do usuário: exigem login com Google. */}
        <Route path="/viagens" element={<Protected><Painel /></Protected>} />
        <Route path="/viagens/:id" element={<Protected><Viagem /></Protected>} />
        <Route path="/perfil" element={<Protected><Perfil /></Protected>} />
        <Route path="/convite/:id" element={<Protected><Convite /></Protected>} />
      </Route>
      <Route path="*" element={<Navigate to="/viagens" replace />} />
    </Routes>
  );
}
