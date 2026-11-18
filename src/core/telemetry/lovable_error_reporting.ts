/**
 * Puente de telemetría de errores capturados por React Error Boundary hacia el preview de Lovable.
 */

type LovableErrorOptions = {
  mechanism?: "manual" | "onerror" | "unhandledrejection" | "react_error_boundary";
  handled?: boolean;
  severity?: "error" | "warning" | "info";
};

type LovableEvents = {
  captureException?: (
    error: unknown,
    context?: Record<string, unknown>,
    options?: LovableErrorOptions,
  ) => void;
};

declare global {
  interface Window {
    __lovableEvents?: LovableEvents;
    __lovableReportRuntimeError?: (payload: {
      message: string;
      stack?: string;
      filename?: string;
    }) => void;
  }
}

/**
 * Envía una excepción interceptada por un boundary de React hacia la telemetría del editor cuando está presente.
 * @param error_capturado - Excepción o `Response` lanzada en el árbol de componentes/rutas.
 * @param contexto_extra - Metadatos adicionales (por ejemplo, identificador del boundary).
 */
export function report_lovable_error(
  error_capturado: unknown,
  contexto_extra: Record<string, unknown> = {},
): void {
  if (typeof window === "undefined") return;
  window.__lovableEvents?.captureException?.(
    error_capturado,
    {
      source: "react_error_boundary",
      route: window.location.pathname,
      ...contexto_extra,
    },
    {
      mechanism: "react_error_boundary",
      handled: false,
      severity: "error",
    },
  );

  // En producción React no relanza errores del boundary a window.onerror; se reenvían explícitamente al hook del editor
  const mensaje_error =
    error_capturado instanceof Response
      ? `Response ${error_capturado.status}${error_capturado.url ? ` at ${error_capturado.url}` : ""}`
      : error_capturado instanceof Error
        ? error_capturado.message
        : String(error_capturado);
  const stack_error = error_capturado instanceof Error ? error_capturado.stack : undefined;

  window.__lovableReportRuntimeError?.({
    message: mensaje_error,
    ...(stack_error !== undefined && { stack: stack_error }),
    filename: window.location.pathname,
  });
}
