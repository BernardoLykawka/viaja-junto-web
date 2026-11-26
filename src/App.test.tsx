import { describe, expect, it, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Sessão controlada pelo teste (sem Firebase).
const auth = vi.hoisted(() => ({ status: 'anon' as 'anon' | 'authed' | 'loading' }));
vi.mock('./lib/auth', () => ({
  useAuth: () => ({ status: auth.status, firebaseReady: true, redirectError: null, signInWithGoogle: vi.fn(), signOut: vi.fn() }),
  getAccessToken: async () => (auth.status === 'authed' ? 'token' : null),
  expireSession: vi.fn(),
  consumeExpiredNotice: () => false,
}));

const { App } = await import('./App');

/** API falsa: catálogo vazio e, com sessão, um usuário sem viagens. */
function mockApi() {
  vi.stubGlobal('fetch', vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(String(input));
    const body =
      url.pathname === '/users/me' ? { id: 1, nome: 'Bernardo Teste', email: 'b@t' }
      : url.pathname === '/trips' ? { data: [], meta: { page: 1, totalPages: 0, totalItems: 0 } }
      : url.pathname.endsWith('/featured') ? []
      : { content: [], totalElements: 0, last: true };
    return new Response(JSON.stringify(body), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }));
}

function renderAt(path: string) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <App />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

describe('rotas e login', () => {
  beforeEach(() => {
    auth.status = 'anon';
    mockApi();
  });

  it('o Início abre sem login e convida para entrar, sem redirecionar', async () => {
    renderAt('/');
    expect(await screen.findByRole('heading', { level: 1, name: /sua viagem/i })).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /entrar/i }).length).toBeGreaterThan(0);
    expect(screen.queryByRole('heading', { name: 'Minhas viagens' })).not.toBeInTheDocument();
  });

  it('o catálogo (Descobrir) abre sem login', async () => {
    renderAt('/descobrir');
    expect(await screen.findByRole('heading', { level: 1, name: 'Descobrir' })).toBeInTheDocument();
  });

  it.each(['/viagens', '/viagens/1', '/perfil', '/convite/1?codigo=ABC123'])('%s sem login vai para a tela de entrar', async (path) => {
    renderAt(path);
    expect(await screen.findByRole('button', { name: /entrar com google/i })).toBeInTheDocument();
  });

  it('com login, Minhas viagens abre e oferece criar e entrar com código', async () => {
    auth.status = 'authed';
    renderAt('/viagens');
    expect(await screen.findByRole('heading', { level: 1, name: 'Minhas viagens' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /nova viagem/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar com código/i })).toBeInTheDocument();
  });

  it('endereço desconhecido mostra "Página não encontrada"', async () => {
    renderAt('/nao-existe');
    expect(await screen.findByRole('heading', { name: /página não encontrada/i })).toBeInTheDocument();
  });
});
