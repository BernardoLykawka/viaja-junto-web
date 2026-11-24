import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuth } from './lib/auth';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Painel } from './pages/Painel';
import { Viagem } from './pages/Viagem';
import { Descobrir } from './pages/Descobrir';
import { Perfil } from './pages/Perfil';

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
      <Route
        element={
          <Protected>
            <Layout />
          </Protected>
        }
      >
        <Route path="/viagens" element={<Painel />} />
        <Route path="/viagens/:id" element={<Viagem />} />
        <Route path="/descobrir" element={<Descobrir />} />
        <Route path="/perfil" element={<Perfil />} />
      </Route>
      <Route path="*" element={<Navigate to="/viagens" replace />} />
    </Routes>
  );
}
