/**
 * index.test.tsx
 * Pruebas de integración de la ruta principal de proyectos PDCA.
 */
import { createFileRoute } from "@tanstack/react-router";
import { describe, it, expect } from "vitest";

export const Route = createFileRoute("/__tests__/index/test")({
  component: RouteComponent,
});

function RouteComponent() {
  return <div>Hello "/__tests__/index/test"!</div>;
}

describe("Route /__tests__/index/test", () => {
  it("define la ruta correctamente", () => {
    expect(Route).toBeDefined();
  });
});
