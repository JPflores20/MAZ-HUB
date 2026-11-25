/**
 * @fileoverview Route adapter for `/dashboard` delegating UI rendering to ExecutiveDashboardView.
 */

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard de mejora continua · MAZ HUB" },
      {
        name: "description",
        content: "Resumen de avance de los ciclos PDCA del programa de Grupo Modelo.",
      },
      { property: "og:title", content: "Dashboard de mejora continua · MAZ HUB" },
      {
        property: "og:description",
        content: "Indicadores de avance, fases activas y últimos movimientos de tus PDCAs.",
      },
    ],
  }),
  component: lazyRouteComponent(
    () => import("@/features/dashboard/executive_dashboard_view"),
    "ExecutiveDashboardView",
  ),
});
