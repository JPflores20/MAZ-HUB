import React from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatearValorPareto, type FilaPareto } from "./pareto-utils";

interface PropiedadesTablaPareto {
  filasPareto: FilaPareto[];
  gapTotal: number;
  unidadMedida: string;
  longitudDatosOriginales: number;
  alActualizarFila: (
    idFila: number,
    campoModificado: "area" | "gap",
    nuevoValor: string | number,
  ) => void;
  alEliminarFila: (idFila: number) => void;
}

export function TablaPareto({
  filasPareto,
  gapTotal,
  unidadMedida,
  longitudDatosOriginales,
  alActualizarFila,
  alEliminarFila,
}: PropiedadesTablaPareto) {
  const { t } = useTranslation();

  return (
    <div className="overflow-x-auto border rounded-md">
      <Table className="text-xs">
        <TableHeader className="bg-[#0078D7] [&_th]:text-white">
          <TableRow className="hover:bg-[#0078D7]">
            <TableHead className="py-2 px-3 font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
              ÁREA / CATEGORÍA
            </TableHead>
            <TableHead className="py-2 px-3 w-24 font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
              VALOR (GAP)
            </TableHead>
            <TableHead className="py-2 px-3 w-20 font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
              % IND.
            </TableHead>
            <TableHead className="py-2 px-3 w-20 font-bold uppercase text-[10px] tracking-wider text-white">
              % ACUM.
            </TableHead>
            <TableHead className="w-10 text-white" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {filasPareto.map((filaItem) => (
            <TableRow key={filaItem.id}>
              <TableCell className="py-1.5 px-3">
                <Input
                  value={filaItem.area ?? ""}
                  onChange={(eventoCambioInput) =>
                    alActualizarFila(filaItem.id ?? 0, "area", eventoCambioInput.target.value)
                  }
                  placeholder="Ej. Envasado..."
                  className="h-7 text-xs shadow-none border-0 px-1 bg-transparent
                    hover:bg-secondary/50 focus-visible:bg-background"
                />
              </TableCell>
              <TableCell className="py-1.5 px-3">
                <Input
                  type="number"
                  value={filaItem.gap ?? ""}
                  onChange={(eventoCambioInput) =>
                    alActualizarFila(
                      filaItem.id ?? 0,
                      "gap",
                      Number(eventoCambioInput.target.value),
                    )
                  }
                  className="h-7 text-xs shadow-none border-0 px-1 bg-transparent
                    hover:bg-secondary/50 focus-visible:bg-background text-right"
                />
              </TableCell>
              <TableCell className="py-1.5 px-3 font-mono text-muted-foreground">
                {filaItem.porcentajeIndividual.toFixed(1)}%
              </TableCell>
              <TableCell className="py-1.5 px-3 font-mono text-muted-foreground font-semibold">
                {filaItem.porcentajeAcumulado.toFixed(1)}%
              </TableCell>
              <TableCell className="py-1.5">
                {longitudDatosOriginales > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => alEliminarFila(filaItem.id ?? 0)}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-secondary/20">
            <TableCell className="py-2 px-3 font-bold text-right">TOTAL</TableCell>
            <TableCell className="py-2 px-3 font-bold font-mono text-right">
              {formatearValorPareto(gapTotal, unidadMedida)}
            </TableCell>
            <TableCell className="py-2 px-3 font-bold font-mono">100%</TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
