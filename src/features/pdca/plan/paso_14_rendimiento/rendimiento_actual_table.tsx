/**
 * @fileoverview Tabla de indicadores de proceso (PI) con estación de trabajo, herramienta y responsable (Paso 14).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { RendimientoActualPiItem } from "@/domain/pdca";

interface PropiedadesTablaRendimiento {
  registros_indicadores: RendimientoActualPiItem[];
  al_actualizar_registro: (
    registro_id: string,
    campo_modificado: keyof RendimientoActualPiItem,
    nuevo_valor: string,
  ) => void;
  al_eliminar_registro: (registro_id: string) => void;
}

const CAMPOS_RENDIMIENTO: {
  campo: keyof RendimientoActualPiItem;
  centrado?: boolean;
}[] = [
  { campo: "estacionTrabajo" },
  { campo: "nombreIndicador" },
  { campo: "estadoActual", centrado: true },
  { campo: "puestoResponsable", centrado: true },
  { campo: "herramienta" },
  { campo: "ubicacion" },
];

/**
 * Muestra y edita los PIs rastreados en cartas SIC o tableros de proceso.
 */
export const TablaRendimientoActual: React.FC<PropiedadesTablaRendimiento> = ({
  registros_indicadores,
  al_actualizar_registro,
  al_eliminar_registro,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="border rounded-md overflow-x-auto shadow-sm">
      <Table className="min-w-[900px] text-xs">
        <TableHeader>
          <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
            <TableHead className="font-bold text-white text-center border-r border-white/20">
              Estación de trabajo de operador o técnico
            </TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">
              {translate("pdcaPlan.paso14_rendimiento_table_indicator", "Nombre de Indicador")}
            </TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">
              {translate("pdcaPlan.paso14_rendimiento_table_current_state", "Estado Actual")}
            </TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">
              {translate("pdcaPlan.paso14_rendimiento_table_responsible", "Puesto Responsable")}
            </TableHead>
            <TableHead className="font-bold text-white text-center border-r border-white/20">
              {translate(
                "pdcaPlan.paso14_rendimiento_table_tool",
                "Herramienta en la que se Encuentra",
              )}
            </TableHead>
            <TableHead className="font-bold text-white text-center">Ubicación de PI</TableHead>
            <TableHead className="w-12 bg-white" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {(!registros_indicadores || registros_indicadores.length === 0) && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No hay datos registrados.
              </TableCell>
            </TableRow>
          )}
          {registros_indicadores?.map((registro_actual) => (
            <TableRow key={registro_actual.id} className="border-b border-border">
              {CAMPOS_RENDIMIENTO.map(({ campo, centrado }, indice_campo) => (
                <TableCell
                  key={campo}
                  className={`p-1.5 ${indice_campo < CAMPOS_RENDIMIENTO.length - 1 ? "border-r border-border" : ""}`}
                >
                  <Input
                    value={(registro_actual[campo] as string) ?? ""}
                    onChange={(evento) =>
                      al_actualizar_registro(registro_actual.id, campo, evento.target.value)
                    }
                    placeholder="..."
                    className={`h-8 text-xs shadow-none ${centrado ? "text-center" : ""}`}
                  />
                </TableCell>
              ))}
              <TableCell className="p-1.5 text-center">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => al_eliminar_registro(registro_actual.id)}
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
