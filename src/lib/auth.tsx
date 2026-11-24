import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { initializeApp } from 'firebase/app';
import {
  GoogleAuthProvider,
  browserLocalPersistence,
  getAuth,
  getRedirectResult,
  onIdTokenChanged,
  setPersistence,
  signInWithPopup,
  signInWithRedirect,
  signOut as fbSignOut,
  type Auth,
} from 'firebase/auth';
import { firebaseConfig } from './env';

type Status = 'loading' | 'anon' | 'authed';

interface AuthValue {
  status: Status;
  /** Firebase configurado neste ambiente? Sem ele não há como entrar. */
  firebaseReady: boolean;
  /** Erro vindo da volta do login por redirecionamento (código do Firebase). */
  redirectError: string | null;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const auth: Auth | null = firebaseConfig ? getAuth(initializeApp(firebaseConfig)) : null;
if (auth) void setPersistence(auth, browserLocalPersistence);

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: 'select_account' });

/**
 * Ambientes sem suporte a popup seguem por redirecionamento. Popup bloqueado NÃO cai aqui: no Firefox e no Safari
 * o redirecionamento de localhost para firebaseapp.com perde a sessão (armazenamento de terceiros particionado),
 * então é melhor pedir para liberar o popup.
 */
const FALLBACK_TO_REDIRECT = new Set(['auth/operation-not-supported-in-this-environment', 'auth/web-storage-unsupported']);

/** Token atual para o cabeçalho Authorization (o Firebase renova sozinho quando vence). */
export async function getAccessToken(): Promise<string | null> {
  return auth?.currentUser ? auth.currentUser.getIdToken() : null;
}

const AuthContext = createContext<AuthValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>(auth ? 'loading' : 'anon');
  const [redirectError, setRedirectError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth) return;
    // Volta do Google depois de um login por redirecionamento.
    getRedirectResult(auth).catch((e: { code?: string }) => setRedirectError(e.code ?? 'auth/unknown'));
    return onIdTokenChanged(auth, (user) => setStatus(user ? 'authed' : 'anon'));
  }, []);

  const signInWithGoogle = useCallback(async () => {
    if (!auth) throw Object.assign(new Error('Firebase não configurado'), { code: 'app/firebase-not-configured' });
    setRedirectError(null);
    try {
      await signInWithPopup(auth, provider);
    } catch (e) {
      const code = (e as { code?: string }).code ?? '';
      if (!FALLBACK_TO_REDIRECT.has(code)) throw e;
      await signInWithRedirect(auth, provider);
    }
  }, []);

  const signOut = useCallback(async () => {
    if (auth) await fbSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ status, firebaseReady: !!auth, redirectError, signInWithGoogle, signOut }),
    [status, redirectError, signInWithGoogle, signOut],
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth fora do AuthProvider');
  return ctx;
}

let expired = false;

/** Chamado quando a API responde 401: encerra a sessão e a rota protegida volta ao login. */
export function expireSession(): void {
  expired = true;
  if (auth) void fbSignOut(auth);
}

/** A tela de login usa isto para explicar por que a pessoa voltou para ela. Lê uma vez só. */
export function consumeExpiredNotice(): boolean {
  const was = expired;
  expired = false;
  return was;
}
