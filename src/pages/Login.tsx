import { useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Compass, GoogleLogo } from '@phosphor-icons/react';
import { consumeExpiredNotice, useAuth } from '../lib/auth';
import { Alert, Button } from '../components/ui';

const MESSAGES: Record<string, string> = {
  'auth/popup-closed-by-user': 'A janela do Google foi fechada antes de terminar. Clique em "Entrar com Google" para tentar de novo.',
  'auth/cancelled-popup-request': 'A janela do Google foi fechada antes de terminar. Clique em "Entrar com Google" para tentar de novo.',
  'auth/unauthorized-domain': 'Este endereço não está autorizado no Firebase. Adicione o domínio em Authentication > Configurações > Domínios autorizados.',
  'auth/operation-not-allowed': 'O login com Google está desativado no Firebase. Ative em Authentication > Método de login > Google.',
  'auth/network-request-failed': 'Sem conexão com o Google. Verifique sua internet e tente de novo.',
  'auth/configuration-not-found': 'O Authentication não foi ativado neste projeto Firebase. No console, abra Authentication, clique em "Vamos começar" e ative o provedor Google.',
  'auth/popup-blocked': 'O navegador bloqueou a janela do Google. Permita pop-ups para este site e clique de novo em "Entrar com Google".',
};
const message = (code: string) => MESSAGES[code] ?? 'Não consegui entrar com o Google. Tente de novo em instantes.';

export function Login() {
  const { status, firebaseReady, redirectError, signInWithGoogle } = useAuth();
  const loc = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [expired] = useState(consumeExpiredNotice);

  if (status === 'authed') return <Navigate to={(loc.state as { from?: string } | null)?.from ?? '/viagens'} replace />;

  async function google() {
    setBusy(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (e) {
      setError(message((e as { code?: string }).code ?? ''));
    } finally {
      setBusy(false);
    }
  }

  const shownError = error ?? (redirectError ? message(redirectError) : null);

  return (
    <main className="login" id="conteudo">
      <div className="login-card">
        <span className="brand" style={{ cursor: 'default' }}>
          <span className="brand-mark">
            <Compass weight="fill" size={24} aria-hidden />
          </span>
          <span className="type-headline-sm">ViajaJunto</span>
        </span>
        <div className="stack-sm">
          <p className="type-label-overline" style={{ color: 'var(--color-primary-strong)' }}>Planeje. Divida. Viaje.</p>
          <h1 className="type-display-hero hero-title" style={{ fontSize: 'var(--text-display-hero-mobile)' }}>
            Sua viagem <em style={{ fontStyle: 'italic', color: 'var(--color-primary)' }}>começa aqui.</em>
          </h1>
          <p className="type-body-lg muted">Monte o roteiro, controle o orçamento e divida as despesas com quem vai junto.</p>
        </div>

        {expired && !shownError && <Alert kind="warning">Sua sessão expirou ou não foi aceita pelo servidor. Entre de novo com o Google.</Alert>}
        {shownError && <Alert kind="error">{shownError}</Alert>}
        {!firebaseReady && (
          <Alert kind="warning">
            O login com Google ainda não está configurado neste ambiente. Preencha as variáveis <code>VITE_FIREBASE_*</code> em <code>.env.local</code> (veja <code>.env.example</code>).
          </Alert>
        )}

        {/* O botão continua clicável enquanto o popup está aberto: se a janela sumir atrás de outra ou for bloqueada,
            um novo clique cancela a tentativa anterior e abre outra (o Firebase cuida disso). */}
        <Button icon={GoogleLogo} onClick={google} busy={status === 'loading'} disabled={!firebaseReady} aria-busy={busy}>
          Entrar com Google
        </Button>
      </div>
    </main>
  );
}
