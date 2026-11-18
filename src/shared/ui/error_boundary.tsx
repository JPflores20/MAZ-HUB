/**
 * error_boundary.tsx
 * Contenedor de seguridad React (`ErrorBoundary`) para capturar fallos de renderizado sin colapsar la vista.
 */
import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { Alert, AlertTitle, AlertDescription } from "./alert";

interface ErrorBoundaryProps {
  children?: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  has_error: boolean;
  captured_error: Error | null;
}

/**
 * Envuelve subárboles propensos a errores de ejecución o renderizado (p. ej. grafos interactivos)
 * mostrando una alerta controlada en caso de excepción.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    has_error: false,
    captured_error: null,
  };

  public static getDerivedStateFromError(captured_error: Error): ErrorBoundaryState {
    return { has_error: true, captured_error };
  }

  public override componentDidCatch(captured_error: Error, error_info: ErrorInfo) {
    console.error("Uncaught error in ErrorBoundary:", captured_error, error_info);
  }

  public override render() {
    if (this.state.has_error) {
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
            {this.state.captured_error?.message || "Algo salió mal al cargar este componente."}
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
