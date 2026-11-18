/**
 * Punto de entrada del cliente (hidratación y montaje React + TanStack Router en navegador).
 */
import "./suppress-warnings";
import { createRoot, hydrateRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";
import "@/core/i18n";

const enrutador_app = getRouter();
const elemento_raiz = document.getElementById("root");

if (elemento_raiz) {
  if (elemento_raiz.children.length > 0) {
    hydrateRoot(elemento_raiz, <RouterProvider router={enrutador_app} />);
  } else {
    createRoot(elemento_raiz).render(<RouterProvider router={enrutador_app} />);
  }
}

// Limpia Service Workers antiguos o persistentes (por ejemplo Workbox) en cliente local
if (typeof window !== "undefined" && "serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registros_sw) => {
    for (const registro_actual of registros_sw) {
      registro_actual.unregister().catch(() => {});
    }
  });
}
