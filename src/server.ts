/**
 * Punto de entrada del servidor SSR/SPA para TanStack Start.
 */
import "@/core/telemetry/error_capture";

import { consume_last_captured_error } from "@/core/telemetry/error_capture";
import { render_error_page } from "@/core/telemetry/error_page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let promesa_entrada_servidor: Promise<ServerEntry> | undefined;

/**
 * Carga perezosamente el entrypoint de servidor de TanStack Start y lo memoriza entre peticiones.
 * @returns Handler principal de servidor SSR.
 */
async function get_server_entry(): Promise<ServerEntry> {
  if (!promesa_entrada_servidor) {
    promesa_entrada_servidor = import("@tanstack/react-start/server-entry").then(
      (modulo_servidor) => (modulo_servidor.default ?? modulo_servidor) as ServerEntry,
    );
  }
  return promesa_entrada_servidor;
}

/**
 * Intercepta respuestas HTTP 500 JSON genéricas de h3 para registrar el error original
 * capturado y devolver una página de error genérica sin filtrar trazas internas.
 * @param respuesta_ssr - Respuesta generada por el runtime de servidor.
 * @returns Respuesta original o página de error segura si h3 absorbió una excepción.
 */
async function normalize_catastrophic_ssr_response(respuesta_ssr: Response): Promise<Response> {
  if (respuesta_ssr.status < 500) return respuesta_ssr;
  const tipo_contenido = respuesta_ssr.headers.get("content-type") ?? "";
  if (!tipo_contenido.includes("application/json")) return respuesta_ssr;

  const cuerpo_texto = await respuesta_ssr.clone().text();
  if (!is_h3_swallowed_error_body(cuerpo_texto)) return respuesta_ssr;

  console.error(
    consume_last_captured_error() ?? new Error(`h3 swallowed SSR error: ${cuerpo_texto}`),
  );
  return new Response(render_error_page(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

/**
 * Detecta el formato estándar de error 500 no manejado emitido por h3.
 * @param cuerpo_texto - Cuerpo JSON serializado de la respuesta.
 * @returns `true` cuando corresponde a un error absorbido por h3.
 */
function is_h3_swallowed_error_body(cuerpo_texto: string): boolean {
  try {
    const carga_error = JSON.parse(cuerpo_texto) as { unhandled?: unknown; message?: unknown };
    return carga_error.unhandled === true && carga_error.message === "HTTPError";
  } catch {
    return false;
  }
}

export default {
  async fetch(peticion: Request, entorno: unknown, contexto: unknown) {
    try {
      const manejador_servidor = await get_server_entry();
      const respuesta_ssr = await manejador_servidor.fetch(peticion, entorno, contexto);
      return await normalize_catastrophic_ssr_response(respuesta_ssr);
    } catch (error_servidor) {
      console.error(error_servidor);
      return new Response(render_error_page(), {
        status: 500,
        headers: { "content-type": "text/html; charset=utf-8" },
      });
    }
  },
};
