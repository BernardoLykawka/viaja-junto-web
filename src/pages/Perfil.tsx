import { SignOut } from '@phosphor-icons/react';
import { useAuth } from '../lib/auth';
import { errorMessage } from '../lib/api';
import { useMe } from '../lib/queries';
import { Alert, Avatar, Button, Skeleton } from '../components/ui';

export function Perfil() {
  const { signOut } = useAuth();
  const { data: me, isLoading, error } = useMe();
  return (
    <div className="container page-work" style={{ maxWidth: 640 }}>
      <h1 className="type-headline-lg page-title" style={{ marginBottom: 'var(--spacing-lg)' }}>Perfil</h1>
      {error && <Alert kind="error">{errorMessage(error)}</Alert>}
      <section className="card" style={{ display: 'grid', gap: 'var(--spacing-lg)' }} aria-busy={isLoading}>
        {isLoading ? (
          <Skeleton style={{ height: 56 }} />
        ) : (
          me && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
              <Avatar name={me.name} />
              <div>
                <p className="type-title-md">{me.name}</p>
                <p className="type-body-sm muted">{me.email}</p>
              </div>
            </div>
          )
        )}
        <Button variant="secondary" icon={SignOut} onClick={() => void signOut()}>
          Sair
        </Button>
      </section>
    </div>
  );
}
