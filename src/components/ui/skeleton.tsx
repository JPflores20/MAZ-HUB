/**
 * skeleton.tsx
 * Componente base de interfaz (shadcn/ui) para indicadores de carga (placeholders animados).
 */
import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-primary/10", className)} {...props} />;
}

export { Skeleton };
