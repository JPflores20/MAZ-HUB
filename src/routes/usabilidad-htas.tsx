/**
 * @fileoverview Route adapter for `/usabilidad-htas` delegating UI rendering to UsabilidadHerramientasView.
 */

import { createFileRoute } from "@tanstack/react-router";
import { UsabilidadHerramientasView } from "@/features/usabilidad";

export const Route = createFileRoute("/usabilidad-htas")({
  head: () => ({
    meta: [
      { title: "Usabilidad de Herramientas (5Ws y RDAs) · MAZ HUB" },
      {
        name: "description",
        content:
          "Análisis de Uso de Herramientas de Gestión (5Ws, RDAs, PDCAs), Ciclo SDCA, Deudores y Evaluación de Calidad IAL.",
      },
    ],
  }),
  component: UsabilidadHerramientasView,
});
