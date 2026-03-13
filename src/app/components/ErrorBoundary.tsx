import React, { Component, ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCcw, Home } from "lucide-react";
import { Button } from "./ui/button";

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

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleGoHome = () => {
    this.setState({ hasError: false, error: null });
    window.location.href = "/";
  };

  public render() {
    if (this.state.hasError) {
      const isDev = (import.meta as any).env.MODE === "development" || (import.meta as any).env.MODE === "local";


      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 p-8 text-center space-y-6">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto">
              <AlertTriangle className="text-red-600 dark:text-red-400" size={32} />
            </div>
            
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Something went wrong</h1>
              <p className="text-gray-500 dark:text-gray-400">
                An unexpected error occurred. We've been notified and are looking into it.
              </p>
            </div>

            {isDev && this.state.error && (
              <div className="text-left p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-lg overflow-auto max-h-60">
                <p className="text-xs font-mono text-red-700 dark:text-red-400 whitespace-pre-wrap">
                  {this.state.error.stack || this.state.error.message}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-3">
              <Button 
                onClick={this.handleReset}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center gap-2"
              >
                <RefreshCcw size={18} /> Try Again
              </Button>
              <Button 
                onClick={this.handleGoHome}
                variant="outline"
                className="w-full border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 flex items-center justify-center gap-2"
              >
                <Home size={18} /> Go to Dashboard
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
