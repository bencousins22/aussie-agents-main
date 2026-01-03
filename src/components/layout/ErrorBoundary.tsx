import { Component } from "react";
import type { ErrorInfo, ReactNode } from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "../ui/Button";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-zinc-900 border border-red-500/20 rounded-[var(--radius-3xl)] p-8 text-center shadow-2xl backdrop-blur-3xl">
            <div className="size-16 bg-red-500/10 border border-red-500/20 rounded-2xl grid place-items-center mx-auto mb-6">
              <AlertCircle className="size-8 text-red-500" />
            </div>
            
            <h1 className="text-xl font-black text-white uppercase tracking-wider mb-4">
              System Interrupted
            </h1>
            
            <p className="text-white/60 text-sm mb-8 leading-relaxed">
              An unexpected error occurred in the Aussie Agents interface. We've logged the incident.
            </p>
            
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => window.location.reload()}
              leftIcon={<RefreshCcw className="size-4" />}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Reinitialize
            </Button>
            
            {import.meta.env.DEV && (
              <pre className="mt-8 p-4 bg-black/40 rounded-xl text-left text-caption text-red-400 font-mono overflow-auto max-h-40 border border-red-500/10">
                {this.state.error?.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
