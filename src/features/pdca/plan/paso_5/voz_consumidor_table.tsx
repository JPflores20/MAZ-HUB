/**
 * @fileoverview Paso 5 del PDCA: Tabla de Voz del Consumidor / Cliente Interno (VOC).
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import { StepCard } from "@/shared/ui/step_card";
import type { VozDelConsumidorItem } from "@/domain/pdca";

interface PropiedadesVozConsumidorTable {
  items: VozDelConsumidorItem[];
  onChange: (registros: VozDelConsumidorItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Permite capturar necesidades del cliente interno/externo, métricas e indicadores críticos de calidad.
 */
export const VozConsumidorTable: React.FC<PropiedadesVozConsumidorTable> = ({
  items,
  onChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}) => {
  const { t: translate } = useTranslation();

  const agregar_fila = () => {
    const nuevo_registro: VozDelConsumidorItem = {
      id: crypto.randomUUID(),
      necesidad: "",
      importancia: "",
      metrica: "",
      comentario: "",
    };
    onChange([...(items || []), nuevo_registro]);
  };

  const actualizar_campo = (
    registro_id: string,
    campo: keyof VozDelConsumidorItem,
    valor: string,
  ) => {
    onChange(
      items.map((registro_actual) =>
        registro_actual.id === registro_id
          ? { ...registro_actual, [campo]: valor }
          : registro_actual,
      ),
    );
  };

  const eliminar_fila = (registro_id: string) => {
    onChange(items.filter((registro_actual) => registro_actual.id !== registro_id));
  };

  return (
    <StepCard
      title={translate("pdcaPlan.dynamic.paso5VozDelConsumidor")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={agregar_fila} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {translate("pdcaPlan.dynamic.agregarFila")}
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaPlan.dynamic.cliente")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaPlan.dynamic.vozDelCliente")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaPlan.dynamic.indicadorClaveDeProceso")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">
                  {translate("pdcaPlan.dynamic.requerimientoCrTicoDelCliente")}
                </TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {translate("pdcaPlan.dynamic.noHayRegistrosAgregaUno")}
                  </TableCell>
                </TableRow>
              )}
              {items?.map((registro_item) => (
                <TableRow key={registro_item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={registro_item.necesidad}
                      onChange={(evento) =>
                        actualizar_campo(registro_item.id, "necesidad", evento.target.value)
                      }
                      placeholder={translate("pdcaPlan.dynamic.ejUsuarioFinalLogStica")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={registro_item.importancia}
                      onChange={(evento) =>
                        actualizar_campo(registro_item.id, "importancia", evento.target.value)
                      }
                      placeholder={translate("pdcaPlan.dynamic.ejEntregasMSR")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={registro_item.metrica}
                      onChange={(evento) =>
                        actualizar_campo(registro_item.id, "metrica", evento.target.value)
                      }
                      placeholder={translate("pdcaPlan.dynamic.ejLeadTimeOtif")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={registro_item.comentario}
                      onChange={(evento) =>
                        actualizar_campo(registro_item.id, "comentario", evento.target.value)
                      }
                      placeholder={translate("pdcaPlan.dynamic.ejEntregaEn24h")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => eliminar_fila(registro_item.id)}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </StepCard>
  );
};
