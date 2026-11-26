import { Component, type ErrorInfo, type ReactNode } from 'react';
import { WarningCircle } from '@phosphor-icons/react';

interface State {
  error: Error | null;
}

/**
 * Se uma tela quebrar, mostra o aviso no lugar dela em vez de deixar a página em branco.
 * O Layout passa a rota como `key`, então trocar de página limpa o erro.
 */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Erro na tela', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container page-work" role="alert">
        <div className="card empty">
          <WarningCircle size={48} aria-hidden style={{ color: 'var(--color-primary)' }} />
          <h1 className="type-headline-md page-title">Algo deu errado nesta tela</h1>
          <p className="type-body-md muted" style={{ maxWidth: '44ch' }}>
            Recarregue a página para tentar de novo. Se continuar, volte ao início e abra a tela outra vez.
          </p>
          <div className="form-actions" style={{ justifyContent: 'center' }}>
            <a className="button button-secondary type-label-lg" href="/">Ir para o início</a>
            <button type="button" className="button button-primary type-label-lg" onClick={() => window.location.reload()}>Recarregar</button>
          </div>
        </div>
      </div>
    );
  }
}
