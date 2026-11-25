/**
 * @fileoverview Route adapter for `/` delegating UI rendering to PdcaBankView.
 */

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Mis PDCAs · VPO Grupo Modelo" },
      {
        name: "description",
        content: "Crea, da seguimiento y cierra tus reportes PDCA de mejora continua.",
      },
      { property: "og:title", content: "Mis PDCAs · VPO Grupo Modelo" },
      {
        property: "og:description",
        content: "Gestiona tus ciclos Plan-Do-Check-Act de mejora continua en un solo lugar.",
      },
      { property: "og:image", content: "https://maz-pdca-hub.web.app/logos/MAZ.webp" },
      { property: "og:image:secure_url", content: "https://maz-pdca-hub.web.app/logos/MAZ.webp" },
      { property: "og:image:type", content: "image/jpeg" },
      { name: "twitter:image", content: "https://maz-pdca-hub.web.app/logos/MAZ.webp" },
    ],
  }),
  component: lazyRouteComponent(
    () => import("@/features/dashboard/pdca_bank_view"),
    "PdcaBankView",
  ),
});
