import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";

interface PropiedadesCajaCategoria {
  categoria: { id: string; label: string; position: "top" | "bottom" };
  listaCausas: string[];
  alAgregarCausa: (idCategoria: string, valorCausa: string) => void;
  alEliminarCausa: (idCategoria: string, indiceCausa: number) => void;
  alCambiarEtiqueta?: (idCategoria: string, nuevaEtiqueta: string) => void;
}

export function CajaCategoriaIshikawa({
  categoria,
  listaCausas,
  alAgregarCausa,
  alEliminarCausa,
  alCambiarEtiqueta,
}: PropiedadesCajaCategoria) {
  const { t } = useTranslation();

  const [valorTextoInput, asignarValorTextoInput] = useState("");

  const manejarPresionTecla = (eventoTeclado: React.KeyboardEvent<HTMLInputElement>) => {
    if (eventoTeclado.key === "Enter") {
      eventoTeclado.preventDefault();
      alAgregarCausa(categoria.id, valorTextoInput);
      asignarValorTextoInput("");
    }
  };

  return (
    <div className="w-full flex flex-col rounded-md border border-border bg-card shadow-sm overflow-hidden">
      <div className="bg-secondary/60 px-1 py-1 border-b border-border text-center font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground focus-within:bg-secondary/80">
        <input
          type="text"
          value={categoria.label}
          onChange={(eventoInput) => alCambiarEtiqueta?.(categoria.id, eventoInput.target.value)}
          className="w-full bg-transparent text-center outline-none uppercase font-display"
        />
      </div>
      <div className="p-2 flex flex-col gap-1.5 min-h-[60px]">
        {listaCausas.map((causaTexto, indiceElemento) => (
          <div
            key={indiceElemento}
            className="group relative flex items-start gap-1 rounded bg-primary/10 px-2 py-1 text-[11px] font-medium text-primary leading-tight"
          >
            <span className="flex-1 break-words">{causaTexto}</span>
            <button
              type="button"
              onClick={() => alEliminarCausa(categoria.id, indiceElemento)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-primary/60 hover:text-destructive shrink-0 mt-0.5"
            >
              <X className="size-3" />
            </button>
          </div>
        ))}
        <Input
          value={valorTextoInput}
          onChange={(eventoCajaFiltro) => asignarValorTextoInput(eventoCajaFiltro.target.value)}
          onKeyDown={manejarPresionTecla}
          placeholder="+ Causa (Enter)"
          className="h-6 text-[11px] px-1.5 shadow-none border-dashed bg-transparent focus-visible:ring-1"
        />
      </div>
    </div>
  );
}
