/**
 * @fileoverview Tarjeta colapsable reutilizable con montaje diferido (lazy mount) para pasos PDCA.
 */
import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/shared/utils/class_names";

interface PropiedadesTarjetaColapsable {
  card_title: string;
  is_collapsed?: boolean;
  on_toggle_collapse?: () => void;
  children: React.ReactNode;
  additional_header_node?: React.ReactNode;
}

/**
 * Encapsula una sección PDCA evitando montar el subárbol DOM hasta la primera expansión.
 */
export const PdcaCollapsibleCard: React.FC<PropiedadesTarjetaColapsable> = ({
  card_title,
  is_collapsed = true,
  on_toggle_collapse,
  children,
  additional_header_node,
}) => {
  // Estado local aislado para evitar re-colapsar tarjetas durante autoguardados en segundo plano
  const [esta_colapsada, set_esta_colapsada] = useState(is_collapsed);
  const [se_ha_montado, set_se_ha_montado] = useState(!is_collapsed);

  const manejar_alternancia = () => {
    const siguiente_estado = !esta_colapsada;
    set_esta_colapsada(siguiente_estado);
    if (!siguiente_estado && !se_ha_montado) {
      set_se_ha_montado(true);
    }
    on_toggle_collapse?.();
  };

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden transition-all duration-200">
      <div
        className="flex items-center justify-between px-5 py-3.5 bg-muted/30 border-b border-border/70 cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={manejar_alternancia}
      >
        <div className="flex items-center gap-2.5">
          <span className="font-display text-sm font-bold tracking-wide uppercase text-foreground">
            {card_title}
          </span>
          {additional_header_node}
        </div>

        <button
          type="button"
          className="text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
          aria-label={esta_colapsada ? "Expandir sección" : "Colapsar sección"}
        >
          {esta_colapsada ? (
            <ChevronDown className="size-4" />
          ) : (
            <ChevronUp className="size-4" />
          )}
        </button>
      </div>

      <div className={cn("p-5 transition-all", esta_colapsada && "hidden")}>
        {se_ha_montado ? children : null}
      </div>
    </div>
  );
};
