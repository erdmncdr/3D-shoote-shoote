import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('❌ Error Boundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });

    // Here you could send error to logging service (Sentry, etc.)
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8">
            <div className="text-center mb-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
              <p className="text-gray-400">
                An unexpected error occurred. Please try again or reload the page.
              </p>
            </div>

            {/* Error details (only show in development) */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 bg-gray-900 rounded p-4 overflow-auto max-h-48">
                <p className="text-red-400 font-mono text-sm mb-2">{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <pre className="text-gray-500 font-mono text-xs whitespace-pre-wrap">
                    {this.state.errorInfo.componentStack}
                  </pre>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded transition-colors"
              >
                Reload Page
              </button>
            </div>

            <button
              onClick={() => (window.location.href = '/')}
              className="w-full mt-3 bg-transparent hover:bg-gray-700 text-gray-400 hover:text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Go to Main Menu
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
