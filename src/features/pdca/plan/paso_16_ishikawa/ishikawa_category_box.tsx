/**
 * @fileoverview Caja editable por categoría M (Máquina, Método, Material, Mano de obra, Medición, Medio ambiente) en Ishikawa.
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Plus, X } from "lucide-react";
import { Input } from "@/shared/ui/input";

interface PropiedadesCajaCategoria {
  categoria: { id: string; label: string; position: "top" | "bottom" };
  lista_causas: string[];
  al_agregar_causa: (categoria_id: string, valor_causa: string) => void;
  al_eliminar_causa: (categoria_id: string, indice_causa: number) => void;
  al_editar_causa?: (
    categoria_id: string,
    indice_causa: number,
    nuevo_valor: string,
  ) => void;
  al_cambiar_etiqueta?: (categoria_id: string, nueva_etiqueta: string) => void;
}

/**
 * Permite añadir, editar en línea y eliminar causas agrupadas dentro de una rama del diagrama.
 */
export function CajaCategoriaIshikawa({
  categoria,
  lista_causas,
  al_agregar_causa,
  al_eliminar_causa,
  al_editar_causa,
  al_cambiar_etiqueta,
}: PropiedadesCajaCategoria) {
  const { t: translate } = useTranslation();
  const [valor_texto_input, set_valor_texto_input] = useState("");

  const confirmar_agregar_causa = () => {
    const causa_limpia = valor_texto_input.trim();
    if (!causa_limpia) return;
    al_agregar_causa(categoria.id, causa_limpia);
    set_valor_texto_input("");
  };

  const manejar_presion_tecla = (evento: React.KeyboardEvent<HTMLInputElement>) => {
    if (evento.key === "Enter") {
      evento.preventDefault();
      confirmar_agregar_causa();
    }
  };

  return (
    <div className="w-full flex flex-col rounded-md border border-border bg-card text-foreground shadow-sm overflow-hidden">
      <div className="bg-secondary/60 px-1 py-1 border-b border-border text-center font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground focus-within:bg-secondary/80">
        <input
          type="text"
          value={categoria.label}
          onChange={(evento) => al_cambiar_etiqueta?.(categoria.id, evento.target.value)}
          className="w-full bg-transparent text-center outline-none uppercase font-display text-foreground"
        />
      </div>
      <div className="p-2 flex flex-col gap-1.5 min-h-[60px]">
        {lista_causas.map((causa_texto, indice_causa) => {
          if (!String(causa_texto || "").trim()) return null;
          return (
            <div
              key={`${categoria.id}-${indice_causa}`}
              className="group relative flex items-start gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary leading-tight"
            >
              {al_editar_causa ? (
                <input
                  type="text"
                  value={causa_texto}
                  onChange={(evento) =>
                    al_editar_causa(categoria.id, indice_causa, evento.target.value)
                  }
                  className="flex-1 min-w-0 bg-transparent border-none outline-none text-[11px] font-medium text-primary leading-tight focus:underline"
                />
              ) : (
                <span className="flex-1 break-words text-justify">{causa_texto}</span>
              )}
              <button
                type="button"
                onClick={() => al_eliminar_causa(categoria.id, indice_causa)}
                className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/60 hover:text-destructive shrink-0 mt-0.5 cursor-pointer"
                title={translate("common.delete", "Eliminar causa")}
              >
                <X className="size-3" />
              </button>
            </div>
          );
        })}
        <div className="flex items-center gap-1 print:hidden">
          <Input
            value={valor_texto_input}
            onChange={(evento) => set_valor_texto_input(evento.target.value)}
            onKeyDown={manejar_presion_tecla}
            onBlur={confirmar_agregar_causa}
            placeholder="+ Causa (Enter)"
            className="h-6 text-[11px] px-1.5 shadow-none border-dashed bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:ring-1 flex-1"
          />
          {valor_texto_input.trim() && (
            <button
              type="button"
              onMouseDown={(evento) => evento.preventDefault()}
              onClick={confirmar_agregar_causa}
              className="flex size-6 shrink-0 items-center justify-center rounded bg-primary text-primary-foreground hover:bg-primary/90 transition-colors cursor-pointer"
              title="Agregar causa"
            >
              <Plus className="size-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
