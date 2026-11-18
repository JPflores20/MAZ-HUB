/**
 * sonner.tsx
 * Configuración del sistema de notificaciones emergentes (`toasts`) basado en Sonner.
 */
import * as React from "react";
import { Toaster as Sonner } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

/**
 * Contenedor global de notificaciones emergentes con estilos alineados al tema activo.
 *
 * @param props - Propiedades estándar del proveedor `Toaster` de Sonner.
 * @returns Elemento JSX de Sonner.
 */
const Toaster = ({ ...props }: ToasterProps) => (
  <Sonner
    className="toaster group"
    toastOptions={{
      classNames: {
        toast:
          "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
        description: "group-[.toast]:text-muted-foreground",
        actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
        cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
      },
    }}
    {...props}
  />
);

export { Toaster };
