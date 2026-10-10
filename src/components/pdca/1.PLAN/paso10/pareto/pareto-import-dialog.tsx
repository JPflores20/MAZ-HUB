import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { ParetoItem } from "@/data/pdca";

interface PropiedadesDialogoImportar {
  estadoAbierto: boolean;
  alCambiarEstadoAbierto: (abierto: boolean) => void;
  datosActuales: ParetoItem[];
  alCambiarDatos: (nuevosDatos: ParetoItem[]) => void;
}

export function DialogoImportarPareto({
  estadoAbierto,
  alCambiarEstadoAbierto,
  datosActuales,
  alCambiarDatos,
}: PropiedadesDialogoImportar) {
  const [datosPegadosPegados, asignarDatosPegados] = useState("");

  const manejarImportacionExcel = () => {
    if (!datosPegadosPegados.trim()) return;
    const valoresAgrupados: Record<string, number> = {};
    for (const lineaTexto of datosPegadosPegados.split("\n")) {
      if (!lineaTexto.trim()) continue;
      const partesTexto = lineaTexto.split("\t");
      let categoriaExtraida = "";
      let valorExtraido = 0;

      if (partesTexto.length >= 2) {
        categoriaExtraida = partesTexto[0] ? partesTexto[0].trim() : "";
        valorExtraido = partesTexto[1]
          ? parseFloat(partesTexto[1].replace(/,/g, "").trim() || "0")
          : 0;
      } else {
        const partesComa = lineaTexto.split(",");
        if (partesComa.length >= 2) {
          categoriaExtraida = partesComa[0] ? partesComa[0].trim() : "";
          valorExtraido = partesComa[1]
            ? parseFloat(partesComa[1].replace(/,/g, "").trim() || "0")
            : 0;
        } else {
          categoriaExtraida = lineaTexto.trim();
          valorExtraido = 1;
        }
      }

      if (isNaN(valorExtraido)) valorExtraido = 0;

      if (categoriaExtraida) {
        const sumaActual = valoresAgrupados[categoriaExtraida] ?? 0;
        valoresAgrupados[categoriaExtraida] = sumaActual + valorExtraido;
      }
    }

    const mapaExistente: Record<string, number> = {};
    datosActuales.forEach((itemExistente) => {
      const areaRecortada = itemExistente.area?.trim();
      if (areaRecortada) {
        mapaExistente[areaRecortada] =
          (mapaExistente[areaRecortada] ?? 0) + (itemExistente.gap ?? 0);
      }
    });

    for (const claveCategoria in valoresAgrupados) {
      mapaExistente[claveCategoria] =
        (mapaExistente[claveCategoria] ?? 0) + (valoresAgrupados[claveCategoria] ?? 0);
    }

    const nuevosElementosPareto = Object.keys(mapaExistente).map(
      (categoriaActual) =>
        ({
          id: Date.now() + Math.random(),
          area: categoriaActual,
          gap: mapaExistente[categoriaActual] ?? 0,
        }) as ParetoItem,
    );

    alCambiarDatos(nuevosElementosPareto);
    alCambiarEstadoAbierto(false);
    asignarDatosPegados("");
    toast.success("Datos importados correctamente");
  };

  return (
    <Dialog open={estadoAbierto} onOpenChange={alCambiarEstadoAbierto}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Importar Datos desde Excel</DialogTitle>
          <DialogDescription>
            Copia dos columnas (Categoria, Valor) y pégalas aquí.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <Textarea
            value={datosPegadosPegados}
            onChange={(eventoCambioTextarea) =>
              asignarDatosPegados(eventoCambioTextarea.target.value)
            }
            placeholder={"Ejemplo:\nFalla A\t10\nFalla B\t5"}
            className="min-h-[200px] text-xs font-mono whitespace-pre"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => alCambiarEstadoAbierto(false)}>
              Cancelar
            </Button>
            <Button onClick={manejarImportacionExcel}>Importar y Generar</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
