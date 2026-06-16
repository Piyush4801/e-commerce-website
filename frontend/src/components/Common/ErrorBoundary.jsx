import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0a0c10] text-[#f0f3f6] flex flex-col items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-[#161b22] border border-[#30363d] rounded-xl p-8 shadow-2xl text-center space-y-6">
            <div className="text-5xl">❌</div>
            <h1 className="text-2xl font-bold tracking-tight text-red-500">Something went wrong</h1>
            <p className="text-[#8b949e] text-sm">
              An unexpected error occurred in the application.
            </p>
            {this.state.error && (
              <div className="bg-[#0d1117] border border-[#21262d] rounded-lg p-4 text-left text-xs font-mono overflow-auto max-h-40 text-red-400">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex gap-4 justify-center">
              <button
                onClick={this.handleRetry}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition-all shadow-lg shadow-emerald-900/30"
              >
                Retry
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-5 py-2.5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] font-medium rounded-lg text-sm transition-all"
              >
                Back To Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
