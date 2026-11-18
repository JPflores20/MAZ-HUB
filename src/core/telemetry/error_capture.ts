/**
 * Captura global de errores no controlados y expansión de cadenas de causas (`cause`) para diagnóstico SSR/cliente.
 * Intercepta `console.error` para preservar stack traces antes de que h3 los serialice como respuestas genéricas 500.
 */

let ultimo_error_capturado: { error: unknown; timestamp_ms: number } | undefined;
const TTL_CAPTURA_MS = 5_000;
const LIMITE_PROFUNDIDAD_CAUSA = 5;
const LIMITE_LONGITUD_DESCRIPCION = 8_000;

/**
 * Registra el último error ocurrido con marca temporal para inspección fuera de banda.
 * @param error_capturado - Excepción o rechazo de promesa interceptado.
 */
function record_error_snapshot(error_capturado: unknown): void {
  ultimo_error_capturado = { error: error_capturado, timestamp_ms: Date.now() };
}

/**
 * Extrae el código de estado HTTP asociado a un objeto `Error` cuando existe.
 * @param error_actual - Instancia `Error` que puede incluir `status` o `statusCode`.
 * @returns Sufijo formateado con el código HTTP o cadena vacía.
 */
function describe_error_status(error_actual: Error): string {
  const { status, statusCode } = error_actual as { status?: unknown; statusCode?: unknown };
  const codigo_estado = status ?? statusCode;
  return typeof codigo_estado === "number" ? ` (status ${codigo_estado})` : "";
}

/**
 * Serializa de forma segura cualquier valor arbitrario sin lanzar ante referencias circulares.
 * @param valor_arbitrario - Objeto o primitivo a representar en bitácora.
 * @returns Cadena serializada legible.
 */
function safe_stringify(valor_arbitrario: unknown): string {
  try {
    return JSON.stringify(valor_arbitrario) ?? String(valor_arbitrario);
  } catch {
    return String(valor_arbitrario);
  }
}

/**
 * Determina si un argumento de bitácora es una instancia estándar de `Error`.
 * @param candidato - Valor desconocido inspeccionado en `console.error`.
 * @returns `true` cuando es instancia de `Error`.
 */
function is_error_like(candidato: unknown): candidato is Error {
  return candidato instanceof Error;
}

/**
 * Expande una cadena de errores anidados (`cause`) preservando mensajes, stacks y códigos HTTP.
 * @param error_raiz - Error inicial o valor lanzado en runtime.
 * @returns Descripción multilínea truncada a `LIMITE_LONGITUD_DESCRIPCION`.
 */
export function describe_error(error_raiz: unknown): string {
  const segmentos_traza: string[] = [];
  let error_cursor: unknown = error_raiz;

  for (
    let profundidad_actual = 0;
    profundidad_actual < LIMITE_PROFUNDIDAD_CAUSA && error_cursor != null;
    profundidad_actual += 1
  ) {
    if (!(error_cursor instanceof Error)) {
      segmentos_traza.push(
        typeof error_cursor === "string" ? error_cursor : safe_stringify(error_cursor),
      );
      break;
    }
    const etiqueta_origen = profundidad_actual === 0 ? "" : "caused by: ";
    const sufijo_estado = describe_error_status(error_cursor);
    const detalle_error = error_cursor.stack ?? `${error_cursor.name}: ${error_cursor.message}`;
    segmentos_traza.push(`${etiqueta_origen}${detalle_error}${sufijo_estado}`);
    error_cursor = error_cursor.cause;
  }

  return segmentos_traza.join("\n").slice(0, LIMITE_LONGITUD_DESCRIPCION);
}

// Envuelve console.error para registrar errores y expandir su cadena completa antes de serializar en logs
const consola_error_original = console.error.bind(console);
console.error = (...argumentos_log: unknown[]) => {
  const argumentos_expandidos = argumentos_log.map((argumento_actual) => {
    if (!is_error_like(argumento_actual)) return argumento_actual;
    record_error_snapshot(argumento_actual);
    return describe_error(argumento_actual);
  });
  consola_error_original(...argumentos_expandidos);
};

if (typeof globalThis.addEventListener === "function") {
  globalThis.addEventListener("error", (evento_error) =>
    record_error_snapshot((evento_error as ErrorEvent).error ?? evento_error),
  );
  globalThis.addEventListener("unhandledrejection", (evento_promesa) =>
    record_error_snapshot((evento_promesa as PromiseRejectionEvent).reason),
  );
}

/**
 * Recupera y limpia el error capturado más reciente si se encuentra dentro de la ventana TTL.
 * @returns El objeto error capturado originalmente o `undefined` si expiró o no existe.
 */
export function consume_last_captured_error(): unknown {
  if (!ultimo_error_capturado) return undefined;
  if (Date.now() - ultimo_error_capturado.timestamp_ms > TTL_CAPTURA_MS) {
    ultimo_error_capturado = undefined;
    return undefined;
  }
  const error_recuperado = ultimo_error_capturado.error;
  ultimo_error_capturado = undefined;
  return error_recuperado;
}
