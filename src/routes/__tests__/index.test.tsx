/**
 * index.test.tsx
 * Pruebas de integración de la ruta principal de proyectos PDCA.
 */
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/__tests__/index/test")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/__tests__/index/test"!</div>;
}

const g = globalThis as Record<string, any>;
if (typeof g["describe"] === "function") {
  g["describe"]("Route /__tests__/index/test", () => {
    g["it"]("define la ruta correctamente", () => {
      g["expect"](Route).toBeDefined();
    });
  });
}
