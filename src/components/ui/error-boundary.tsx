import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertTitle, AlertDescription } from "./alert";
import { AlertCircle } from "lucide-react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public override state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", error, errorInfo);
  }

  public override render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Alert
          variant="destructive"
          className="my-4 border-destructive/50 bg-destructive/10 text-destructive"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Ocurrió un error inesperado</AlertTitle>
          <AlertDescription>
            {this.state.error?.message || "Algo salió mal al cargar este componente."}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
