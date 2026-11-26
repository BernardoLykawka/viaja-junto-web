import { useState, type FormEvent } from 'react';
import { PencilSimple, SignOut } from '@phosphor-icons/react';
import { useAuth } from '../lib/auth';
import { errorMessage, fieldErrors } from '../lib/api';
import { useMe, useUpdateMe } from '../lib/queries';
import { Alert, Avatar, Button, Field, Skeleton } from '../components/ui';
import { TravelMapSection } from '../components/TravelMapSection';
import { useTravelHistory } from '../lib/travelHistory';

export function Perfil() {
  const { signOut } = useAuth();
  const { data: me, isLoading, error } = useMe();
  const update = useUpdateMe();
  const history = useTravelHistory();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const errs = fieldErrors(update.error);

  function submit(e: FormEvent) {
    e.preventDefault();
    update.mutate(name.trim(), { onSuccess: () => setEditing(false) });
  }

  return (
    <div className="container page-work stack" style={{ maxWidth: 960 }}>
      <h1 className="type-headline-lg page-title">Perfil</h1>
      {error && <Alert kind="error">{errorMessage(error)}</Alert>}
      <section className="card" style={{ display: 'grid', gap: 'var(--spacing-lg)' }} aria-busy={isLoading}>
        {isLoading ? (
          <Skeleton style={{ height: 56 }} />
        ) : me && editing ? (
          <form className="form" onSubmit={submit} noValidate>
            {update.error && !Object.keys(errs).length && <Alert kind="error">{errorMessage(update.error, 'alterar seu perfil')}</Alert>}
            <Field label="Nome" htmlFor="pf-nome" error={errs.nome} helper="É assim que o grupo vê você nas viagens.">
              <input id="pf-nome" maxLength={255} value={name} onChange={(e) => setName(e.target.value)} autoFocus />
            </Field>
            <div className="form-actions">
              <Button variant="secondary" onClick={() => setEditing(false)}>Cancelar</Button>
              <Button type="submit" busy={update.isPending} disabled={!name.trim() || name.trim() === me.name}>Salvar</Button>
            </div>
          </form>
        ) : (
          me && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)', flexWrap: 'wrap' }}>
              <Avatar name={me.name} src={me.avatarUrl} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="type-title-md">{me.name}</p>
                <p className="type-body-sm muted">{me.email}</p>
              </div>
              <Button variant="compact" icon={PencilSimple} onClick={() => { setName(me.name); update.reset(); setEditing(true); }}>Editar nome</Button>
            </div>
          )
        )}
        <Button variant="secondary" icon={SignOut} onClick={() => void signOut()}>Sair</Button>
      </section>
      <TravelMapSection history={history} />
    </div>
  );
}
