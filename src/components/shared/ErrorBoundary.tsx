import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary global — captura erros de renderização React
 * e mostra mensagem amigável em PT-MZ ao invés de tela branca.
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = '/dashboard';
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    if (this.props.fallback) return this.props.fallback;

    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-6">
        <div className="max-w-md w-full text-center space-y-5">
          <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-destructive" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-foreground">
              Algo correu mal
            </h1>
            <p className="text-sm text-muted-foreground">
              Ocorreu um erro inesperado. A nossa equipa foi notificada. Pode tentar
              recarregar a página ou voltar ao painel principal.
            </p>
            {this.state.error?.message && (
              <p className="text-xs text-muted-foreground/80 font-mono mt-3 p-2 bg-muted/40 rounded border border-border break-words">
                {this.state.error.message}
              </p>
            )}
          </div>
          <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
            <Button onClick={this.handleReset} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Tentar novamente
            </Button>
            <Button onClick={this.handleReload} variant="outline" className="gap-2">
              <RefreshCw className="w-4 h-4" /> Recarregar página
            </Button>
            <Button onClick={this.handleHome} className="gap-2">
              <Home className="w-4 h-4" /> Ir para o painel
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;