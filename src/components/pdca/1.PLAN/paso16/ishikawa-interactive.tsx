import React from "react";
import { Maximize2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { CajaCategoriaIshikawa } from "./ishikawa-category-box";
import { MatrizPriorizacionIshikawa } from "./ishikawa-prioritization-matrix";

interface PropiedadesIshikawaInteractivo {
  causasRegistradas: Record<string, string[]>;
  alCambiarCausas: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  efectoPrincipal: string;
  alCambiarEfecto: (nuevoEfecto: string) => void;
  causasPriorizadas?: any[];
  alCambiarCausasPriorizadas?: (nuevasCausas: any[]) => void;
  etiquetasPersonalizadas?: Record<string, string>;
  alCambiarEtiquetas?: (nuevasEtiquetas: Record<string, string> | ((previas: Record<string, string>) => Record<string, string>)) => void;
  sufijoTitulo?: string | undefined;
  tituloPersonalizado?: string | undefined;
  alCambiarTitulo?: ((nuevoTitulo: string) => void) | undefined;
}

export function IshikawaInteractivo({
  causasRegistradas,
  alCambiarCausas,
  efectoPrincipal,
  alCambiarEfecto,
  causasPriorizadas,
  alCambiarCausasPriorizadas,
  etiquetasPersonalizadas = {},
  alCambiarEtiquetas,
  sufijoTitulo = "",
  tituloPersonalizado,
  alCambiarTitulo,
}: PropiedadesIshikawaInteractivo) {
  const arregloCategorias = [
    { id: "machine", label: etiquetasPersonalizadas["machine"] ?? "Concepto de: Máquina", position: "top" as const },
    { id: "method", label: etiquetasPersonalizadas["method"] ?? "Concepto de: Método", position: "top" as const },
    { id: "material", label: etiquetasPersonalizadas["material"] ?? "Concepto de: Material", position: "top" as const },
    { id: "manpower", label: etiquetasPersonalizadas["manpower"] ?? "Concepto de: Mano de Obra", position: "bottom" as const },
    { id: "measurement", label: etiquetasPersonalizadas["measurement"] ?? "Concepto de: Medición", position: "bottom" as const },
    { id: "environment", label: etiquetasPersonalizadas["environment"] ?? "Concepto de: Medio Amb.", position: "bottom" as const },
  ];

  const manejarCambioEtiquetaCategoria = (idCategoriaModificada: string, nuevaEtiquetaTexto: string) => {
    if (alCambiarEtiquetas) {
      alCambiarEtiquetas((etiquetasPrevias) => ({ ...etiquetasPrevias, [idCategoriaModificada]: nuevaEtiquetaTexto }));
    }
  };

  const agregarNuevaCausa = (idCategoriaDestino: string, valorTextoCausa: string) => {
    if (!valorTextoCausa.trim()) return;
    alCambiarCausas((estadoPrevioCausas) => ({
      ...estadoPrevioCausas,
      [idCategoriaDestino]: [...(estadoPrevioCausas[idCategoriaDestino] || []), valorTextoCausa.trim()],
    }));
  };

  const eliminarCausaExistente = (idCategoriaOrigen: string, indiceElementoAEliminar: number) => {
    alCambiarCausas((estadoPrevioCausas) => ({
      ...estadoPrevioCausas,
      [idCategoriaOrigen]: (estadoPrevioCausas[idCategoriaOrigen] || []).filter((_, indiceFiltro) => indiceFiltro !== indiceElementoAEliminar),
    }));
  };

  const renderizarDiagramaPescado = (
    <div className="relative pt-4 pb-4 overflow-x-auto min-h-[400px]">
      <div className="min-w-[800px] relative mt-4">
        <div className="absolute top-1/2 left-0 right-36 h-1.5 bg-border rounded-full -translate-y-1/2 z-0">
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 border-[8px] border-transparent border-l-border"></div>
        </div>

        <div className="absolute top-1/2 right-0 -translate-y-1/2 bg-destructive/10 text-destructive text-[11px] font-bold uppercase tracking-widest p-2 rounded-xl border border-destructive/30 z-10 w-36 text-center flex flex-col items-center justify-center shadow-sm min-h-[90px]">
          <span className="text-[9px] font-semibold text-destructive/70 uppercase tracking-wider mb-1">Efecto / Problema</span>
          <Textarea
            value={efectoPrincipal}
            onChange={(eventoCajaTexto) => alCambiarEfecto(eventoCajaTexto.target.value)}
            placeholder="Escribe el efecto..."
            rows={2}
            className="w-full text-center bg-transparent border-none text-destructive font-bold text-xs resize-none focus-visible:ring-1 focus-visible:ring-destructive/40 p-0 shadow-none"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10">
          {arregloCategorias.filter((categoriaItem) => categoriaItem.position === "top").map((categoriaFiltrada) => (
            <div key={categoriaFiltrada.id} className="flex flex-col items-center">
              <CajaCategoriaIshikawa
                categoria={categoriaFiltrada}
                listaCausas={causasRegistradas[categoriaFiltrada.id] || []}
                alAgregarCausa={agregarNuevaCausa}
                alEliminarCausa={eliminarCausaExistente}
                alCambiarEtiqueta={manejarCambioEtiquetaCategoria}
              />
              <div className="w-0.5 h-8 bg-border"></div>
            </div>
          ))}
        </div>

        <div className="h-4"></div>

        <div className="grid grid-cols-3 gap-4 pr-44 relative z-10">
          {arregloCategorias.filter((categoriaItem) => categoriaItem.position === "bottom").map((categoriaFiltrada) => (
            <div key={categoriaFiltrada.id} className="flex flex-col items-center">
              <div className="w-0.5 h-8 bg-border"></div>
              <CajaCategoriaIshikawa
                categoria={categoriaFiltrada}
                listaCausas={causasRegistradas[categoriaFiltrada.id] || []}
                alAgregarCausa={agregarNuevaCausa}
                alEliminarCausa={eliminarCausaExistente}
                alCambiarEtiqueta={manejarCambioEtiquetaCategoria}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <StepCard
      className="overflow-hidden"
      title={
        <Input
          value={tituloPersonalizado ?? `ISHIKAWA${sufijoTitulo}`}
          onChange={(eventoInputTitulo) => alCambiarTitulo?.(eventoInputTitulo.target.value)}
          placeholder={`ISHIKAWA${sufijoTitulo}`}
          className="text-sm font-bold text-muted-foreground uppercase tracking-wider bg-transparent border-transparent hover:border-border focus-visible:border-border px-2 py-0 h-8 w-64 shadow-none"
        />
      }
      headerRight={
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-2">
              <Maximize2 className="size-3.5" /> Expandir Diagrama
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-[95vw] w-full p-6">
            <h3 className="text-lg font-bold uppercase mb-4">{tituloPersonalizado ?? `ISHIKAWA${sufijoTitulo}`}</h3>
            {renderizarDiagramaPescado}
          </DialogContent>
        </Dialog>
      }
    >
      <div className="space-y-6">
        {renderizarDiagramaPescado}
        <MatrizPriorizacionIshikawa valorMatriz={causasPriorizadas} alCambiarValores={alCambiarCausasPriorizadas} />
      </div>
    </StepCard>
  );
}
