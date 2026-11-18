/**
 * @fileoverview Route adapter for `/pre-incidentes-proceso` delegating UI rendering to PreIncidentesProcesoView.
 */

import { createFileRoute } from "@tanstack/react-router";
import { PreIncidentesProcesoView } from "@/features/pre_incidentes";

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
  component: PreIncidentesProcesoView,
});
