import React from "react";
import { Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AutoResizeTextarea } from "../../auto-resize-textarea";
import { cn } from "@/lib/utils";

interface PropiedadesMatrizPriorizacion {
  valorMatriz?: any[] | undefined;
  alCambiarValores?: ((causasModificadas: any[]) => void) | undefined;
}

export function MatrizPriorizacionIshikawa({
  valorMatriz = [],
  alCambiarValores,
}: PropiedadesMatrizPriorizacion) {
  const causasPorDefecto = [
    { id: 1, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
    { id: 2, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
    { id: 3, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
    { id: 4, text: "", impact: "", authority: "", difficulty: "", criteria: "" },
  ];

  let listaCausasMatriz = causasPorDefecto;
  if (Array.isArray(valorMatriz) && valorMatriz.length > 0) {
    listaCausasMatriz = valorMatriz;
  } else if (valorMatriz && typeof valorMatriz === "object" && !Array.isArray(valorMatriz)) {
    const valoresObjeto = Object.values(valorMatriz);
    if (valoresObjeto.length > 0) listaCausasMatriz = valoresObjeto as any[];
  }

  const actualizarCausaEspecifica = (idCausaSeleccionada: number, nombreCampo: string, valorNuevo: string) => {
    if (alCambiarValores) {
      alCambiarValores(listaCausasMatriz.map((registroCausa) => (registroCausa.id === idCausaSeleccionada ? { ...registroCausa, [nombreCampo]: valorNuevo } : registroCausa)));
    }
  };

  const agregarFilaNueva = () => {
    if (alCambiarValores) {
      alCambiarValores([
        ...listaCausasMatriz,
        { id: Date.now(), text: "", impact: "", authority: "", difficulty: "", criteria: "" },
      ]);
    }
  };

  const eliminarFilaMatriz = (idFilaParaEliminar: number) => {
    if (alCambiarValores && listaCausasMatriz.length > 1) {
      alCambiarValores(listaCausasMatriz.filter((registroFiltro) => registroFiltro.id !== idFilaParaEliminar));
    }
  };

  return (
    <div className="mt-8 border border-[#0078D7] rounded-sm overflow-hidden bg-white shadow-sm dark:bg-background">
      <div className="bg-white dark:bg-background px-2 py-1 flex items-center justify-between border-b border-[#0078D7]">
        <span className="text-[11px] font-bold text-[#0078D7] uppercase tracking-wide">
          PRIORIZACIÓN - CAUSAS PROBABLES - PROBLEMA 1
        </span>
        <Button
          variant="ghost"
          size="sm"
          onClick={agregarFilaNueva}
          className="h-6 px-2 text-[10px] uppercase font-bold text-[#0078D7] hover:bg-[#0078D7]/10"
        >
          <Plus className="size-3 mr-1" /> Agregar causa
        </Button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0078D7] text-white">
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[30%]">CAUSAS PROBABLES</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">IMPACTO SOBRE EL PROBLEMA</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">AUTORIDAD</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">DIFICULTAD</th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">CRITERIO ADICIONAL</th>
              <th className="font-bold uppercase text-center p-2 text-[10px] w-[14%]">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {listaCausasMatriz.map((registroCausaIterador) => {
              const valorImpacto = Number(registroCausaIterador.impact) || 0;
              const valorAutoridad = Number(registroCausaIterador.authority) || 0;
              const valorDificultad = Number(registroCausaIterador.difficulty) || 0;

              let valorTotalCalculado = valorImpacto * valorAutoridad * valorDificultad;
              const textoCriterioLimpio = String(registroCausaIterador.criteria || "").trim();
              const numeroCriterioAdicional = Number(textoCriterioLimpio);

              if (textoCriterioLimpio !== "" && !isNaN(numeroCriterioAdicional)) {
                valorTotalCalculado *= numeroCriterioAdicional;
              }

              const indicadorPrioridadAlta = valorTotalCalculado > 0;

              return (
                <tr key={registroCausaIterador.id} className="border-b border-white group">
                  <td className="bg-[#E2E2E2] dark:bg-secondary p-0 border-r border-white relative group/td">
                    <AutoResizeTextarea
                      value={registroCausaIterador.text}
                      onChange={(nuevoTextoEscrito) => actualizarCausaEspecifica(registroCausaIterador.id, "text", nuevoTextoEscrito)}
                      className="py-1.5 font-medium focus-visible:ring-black/20 text-xs text-center dark:text-foreground pr-8"
                    />
                    {listaCausasMatriz.length > 1 && (
                      <button
                        onClick={() => eliminarFilaMatriz(registroCausaIterador.id)}
                        className="absolute right-2 top-2 text-muted-foreground/60 hover:text-destructive transition-colors"
                        title="Eliminar causa"
                      >
                        <X className="size-3.5" />
                      </button>
                    )}
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={registroCausaIterador.impact}
                      onChange={(eventoInput) => actualizarCausaEspecifica(registroCausaIterador.id, "impact", eventoInput.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={registroCausaIterador.authority}
                      onChange={(eventoInput) => actualizarCausaEspecifica(registroCausaIterador.id, "authority", eventoInput.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <Input
                      type="number"
                      value={registroCausaIterador.difficulty}
                      onChange={(eventoInput) => actualizarCausaEspecifica(registroCausaIterador.id, "difficulty", eventoInput.target.value)}
                      className="h-full min-h-[32px] rounded-none border-none shadow-none bg-transparent font-bold text-white text-center focus-visible:ring-1 focus-visible:ring-white/50 text-xs hide-arrows"
                    />
                  </td>
                  <td className="bg-[#00A2E8] p-0 border-r border-white">
                    <AutoResizeTextarea
                      value={registroCausaIterador.criteria}
                      onChange={(nuevoTextoEscrito) => actualizarCausaEspecifica(registroCausaIterador.id, "criteria", nuevoTextoEscrito)}
                      placeholder="Texto..."
                      className="py-1.5 font-medium text-white text-center focus-visible:ring-white/50 text-xs placeholder:text-white/50"
                    />
                  </td>
                  <td
                    className={cn(
                      "p-0 text-center font-bold text-xs",
                      indicadorPrioridadAlta ? "bg-[#00B050] text-white" : "bg-[#E2E2E2] dark:bg-secondary text-black/60 dark:text-foreground/60",
                    )}
                  >
                    {valorTotalCalculado}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
