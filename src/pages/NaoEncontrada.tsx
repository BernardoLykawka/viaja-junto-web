import { Link } from 'react-router-dom';
import { Compass } from '@phosphor-icons/react';

export function NaoEncontrada() {
  return (
    <div className="container page-work">
      <div className="card empty">
        <Compass size={48} aria-hidden style={{ color: 'var(--color-primary)' }} />
        <h1 className="type-headline-md page-title">Página não encontrada</h1>
        <p className="type-body-md muted">O endereço pode estar errado ou a página mudou de lugar.</p>
        <div className="form-actions" style={{ justifyContent: 'center' }}>
          <Link className="button button-secondary type-label-lg" to="/descobrir">Descobrir destinos</Link>
          <Link className="button button-primary type-label-lg" to="/">Ir para o início</Link>
        </div>
      </div>
    </div>
  );
}
