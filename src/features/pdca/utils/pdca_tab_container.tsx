/**
 * @fileoverview Contenedor memoizado para alternar visibilidad de pestañas PDCA sin re-renderizar pestañas ocultas.
 */
import React from "react";

interface PropiedadesContenedorPestana {
  isActive: boolean;
  children: React.ReactNode;
}

/**
 * Evita reconciliaciones costosas de pestañas inactivas preservando su árbol DOM montado.
 */
export const TabContainer = React.memo(
  ({ isActive, children }: PropiedadesContenedorPestana) => (
    <div className={isActive ? "block" : "hidden"}>{children}</div>
  ),
  (prev_props, next_props) => {
    // Si la pestaña estaba oculta y sigue oculta, omitir re-renderizado de todo su subárbol
    return !prev_props.isActive && !next_props.isActive;
  },
);
