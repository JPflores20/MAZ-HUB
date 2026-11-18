/**
 * skeleton.tsx
 * Componente base de interfaz (shadcn/ui) para indicadores de carga (placeholders animados).
 */
import * as React from "react";
import { cn } from "@/shared/utils/class_names";

/**
 * Placeholder visual con animación pulsante durante la carga de contenido.
 *
 * @param props - Clases CSS y atributos estándar de `div`.
 * @returns Bloque animado de carga.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

export { Skeleton };
