/**
 * router.tsx
 * Configuración e instanciación del enrutador principal de TanStack Router a partir del árbol de rutas.
 */
import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center p-6 text-sm text-muted-foreground">
      Cargando módulo...
    </div>
  );
}

export const getRouter = () => {
  const queryClient = new QueryClient();

  const router = createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultPendingComponent: RouteLoadingFallback,
    defaultPendingMs: 120,
  });

  return router;
};
