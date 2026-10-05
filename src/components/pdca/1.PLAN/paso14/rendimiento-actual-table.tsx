import React from "react";
import { Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RendimientoActualPiItem } from "@/data/pdca";

interface PropiedadesTablaRendimiento {
  registrosIndicadores: RendimientoActualPiItem[];
  alActualizarRegistro: (idRegistro: string, campoModificado: keyof RendimientoActualPiItem, nuevoValor: string) => void;
  alEliminarRegistro: (idRegistro: string) => void;
}

export const TablaRendimientoActual: React.FC<PropiedadesTablaRendimiento> = ({
  registrosIndicadores,
  alActualizarRegistro,
  alEliminarRegistro,
}) => {
  return (
    <div className="border rounded-md overflow-x-auto shadow-sm">
      <Table className="min-w-[900px] text-xs">
        <TableHeader>
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className="font-bold text-white text-center border-r border-white/20">Estación de trabajo de operador o técnico</TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">Nombre de Indicador</TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">Estado Actual</TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">Puesto Responsable</TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">Herramienta en la que se Encuentra</TableHead>
            <TableHead className="font-bold text-white text-center">Ubicación de PI</TableHead>
            <TableHead className="w-12 bg-white"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!registrosIndicadores || registrosIndicadores.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No hay datos registrados.
              </TableCell>
            </TableRow>
          )}
          {registrosIndicadores?.map((registroIterador) => (
            <TableRow key={registroIterador.id} className="border-b border-border">
              <TableCell className="p-1.5 border-r border-border">
                <Input
                  value={registroIterador.estacionTrabajo}
                  onChange={(eventoCajaFiltro) => alActualizarRegistro(registroIterador.id, "estacionTrabajo", eventoCajaFiltro.target.value)}
                  placeholder="..."
                  className="h-8 text-xs shadow-none"
                />
              </TableCell>
              <TableCell className="p-1.5 border-r border-border">
                <Input
                  value={registroIterador.nombreIndicador}
                  onChange={(eventoCajaFiltro) => alActualizarRegistro(registroIterador.id, "nombreIndicador", eventoCajaFiltro.target.value)}
                  placeholder="..."
                  className="h-8 text-xs shadow-none"
                />
              </TableCell>
              <TableCell className="p-1.5 border-r border-border">
                <Input
                  value={registroIterador.estadoActual}
                  onChange={(eventoCajaFiltro) => alActualizarRegistro(registroIterador.id, "estadoActual", eventoCajaFiltro.target.value)}
                  placeholder="..."
                  className="h-8 text-xs shadow-none text-center"
                />
              </TableCell>
              <TableCell className="p-1.5 border-r border-border">
                <Input
                  value={registroIterador.puestoResponsable}
                  onChange={(eventoCajaFiltro) => alActualizarRegistro(registroIterador.id, "puestoResponsable", eventoCajaFiltro.target.value)}
                  placeholder="..."
                  className="h-8 text-xs shadow-none text-center"
                />
              </TableCell>
              <TableCell className="p-1.5 border-r border-border">
                <Input
                  value={registroIterador.herramienta}
                  onChange={(eventoCajaFiltro) => alActualizarRegistro(registroIterador.id, "herramienta", eventoCajaFiltro.target.value)}
                  placeholder="..."
                  className="h-8 text-xs shadow-none"
                />
              </TableCell>
              <TableCell className="p-1.5">
                <Input
                  value={registroIterador.ubicacion}
                  onChange={(eventoCajaFiltro) => alActualizarRegistro(registroIterador.id, "ubicacion", eventoCajaFiltro.target.value)}
                  placeholder="..."
                  className="h-8 text-xs shadow-none"
                />
              </TableCell>
              <TableCell className="p-1.5 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => alEliminarRegistro(registroIterador.id)}
                >
                  <Trash2 className="size-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
