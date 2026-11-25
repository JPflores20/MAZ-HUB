/**
 * @fileoverview Route adapter for `/pre-incidentes-proceso` delegating UI rendering to PreIncidentesProcesoView.
 */

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/pre-incidentes-proceso")({
  head: () => ({
    meta: [
      { title: "Matriz de Precursores e Incidentes de Proceso · MAZ HUB" },
      {
        name: "description",
        content:
          "Matriz de Precursores e Incidentes de Proceso (5Ws, RDA), evaluación de severidad y reportes QIR.",
      },
    ],
  }),
  component: lazyRouteComponent(
    () => import("@/features/pre_incidentes/pre_incidentes_view"),
    "PreIncidentesProcesoView",
  ),
});
