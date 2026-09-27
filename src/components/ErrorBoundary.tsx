import React from 'react';
import { BrandMark } from './BrandLogo';

interface State {
  error: Error | null;
}

// Last line of defence: a crash in any screen shows a recovery page instead of a blank app.
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Letterbook crashed:', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="min-h-[100dvh] bg-[#14181c] text-white flex flex-col items-center justify-center p-8 text-center gap-4">
        <BrandMark className="w-14 h-14" />
        <h1 className="text-lg font-bold">Something went wrong</h1>
        <p className="text-sm text-[#8fa0b5] max-w-xs">
          Letterbook hit an unexpected error. Your diary is saved on this device, so reloading is safe.
        </p>
        <button type="button" onClick={() => window.location.reload()} className="px-5 py-2.5 rounded-xl bg-[#15E558] text-black text-sm font-bold">
          Reload Letterbook
        </button>
        <details className="text-[10px] text-[#556677] max-w-xs">
          <summary className="cursor-pointer">Error details</summary>
          <pre className="mt-2 whitespace-pre-wrap text-left">{this.state.error.message}</pre>
        </details>
      </div>
    );
  }
}
