import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";
import type { SerieCorrelacion, PuntoCorrelacion } from "./flavor-correlation-utils";

interface PropiedadesEditorSerie {
  serie: SerieCorrelacion;
  alActualizarNombre: (idSerie: string, nuevoNombre: string) => void;
  alAgregarPunto: (idSerie: string) => void;
  alEliminarSerie: (idSerie: string) => void;
  alActualizarPunto: (idSerie: string, indicePunto: number, eje: "x" | "y", nuevoValor: number) => void;
  alEliminarPunto: (idSerie: string, indicePunto: number) => void;
}

export function EditorSerieCorrelacion({
  serie,
  alActualizarNombre,
  alAgregarPunto,
  alEliminarSerie,
  alActualizarPunto,
  alEliminarPunto,
}: PropiedadesEditorSerie) {
  const puntosArreglo = (Array.isArray(serie.points) ? serie.points : Object.values(serie.points || {})) as PuntoCorrelacion[];

  return (
    <div className="border rounded p-3 space-y-3 bg-card">
      <div className="flex justify-between items-center gap-2">
        <Input
          value={serie.name}
          onChange={(eventoInput) => alActualizarNombre(serie.id, eventoInput.target.value)}
          className="h-7 text-sm font-bold w-full"
          placeholder="Nombre de la serie"
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => alAgregarPunto(serie.id)}
          className="h-7 text-xs px-2 shrink-0"
        >
          <Plus className="size-3 mr-1" /> Punto
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => alEliminarSerie(serie.id)}
          className="h-7 w-7 text-destructive shrink-0"
        >
          <X className="size-4" />
        </Button>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
        {puntosArreglo.map((puntoItem: PuntoCorrelacion, indicePunto: number) => (
          <div key={puntoItem.id || indicePunto} className="flex items-center gap-1 bg-secondary/30 p-1 rounded border">
            <span className="text-[10px] font-bold w-3 text-center">X</span>
            <Input
              type="number"
              value={puntoItem.x}
              onChange={(eventoInput) => alActualizarPunto(serie.id, indicePunto, "x", Number(eventoInput.target.value))}
              className="h-6 text-xs px-1"
            />
            <span className="text-[10px] font-bold w-3 text-center ml-1">Y</span>
            <Input
              type="number"
              step="0.1"
              value={puntoItem.y}
              onChange={(eventoInput) => alActualizarPunto(serie.id, indicePunto, "y", Number(eventoInput.target.value))}
              className="h-6 text-xs px-1"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => alEliminarPunto(serie.id, indicePunto)}
              className="h-6 w-6 text-destructive shrink-0"
            >
              <X className="size-3" />
            </Button>
          </div>
        ))}
        {puntosArreglo.length === 0 && (
          <p className="text-xs text-muted-foreground col-span-2">
            No hay puntos. Añade uno para comenzar.
          </p>
        )}
      </div>
    </div>
  );
}
