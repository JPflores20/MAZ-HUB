/**
 * Configuración de arranque e inicialización de middlewares globales para TanStack Start.
 */
import { createStart, createCsrfMiddleware, createMiddleware } from "@tanstack/react-start";

import { render_error_page } from "@/core/telemetry/error_page";

const error_middleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error_peticion) {
    if (
      error_peticion != null &&
      typeof error_peticion === "object" &&
      "statusCode" in error_peticion
    ) {
      throw error_peticion;
    }
    console.error(error_peticion);
    return new Response(render_error_page(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

// Reactivar explícitamente protección CSRF en server functions al personalizar src/start.ts
const csrf_middleware = createCsrfMiddleware({
  filter: (contexto_peticion) => contexto_peticion.handlerType === "serverFn",
});

/** Instancia raíz requerida por el runtime de TanStack Start. */
export const startInstance = createStart(() => ({
  requestMiddleware: [error_middleware, csrf_middleware],
}));
