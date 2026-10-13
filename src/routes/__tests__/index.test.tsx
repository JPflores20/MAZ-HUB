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
