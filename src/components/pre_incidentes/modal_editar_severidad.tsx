/**
 * modal_editar_severidad.tsx
 * Diálogo modal para evaluar o editar la Matriz de Severidad (7 criterios),
 * el estado del reporte QIR y los 12 pilares del ciclo SDCA de un registro existente.
 */
import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { calcular_puntaje_severidad } from "@/data/usabilidad/usabilidad_calculators";
import type {
  CriteriosSeveridad,
  EstatusReporteIncidente,
  MapaPilaresSdca,
  RegistroAnalisis5WRda,
} from "@/data/usabilidad/usabilidad_types";
import { SelectoresSeveridadYSdca } from "./selectores_severidad_y_sdca";

interface PropiedadesModalEditarSeveridad {
  registro_en_edicion: RegistroAnalisis5WRda | null;
  borrador_severidad: CriteriosSeveridad;
  on_cambiar_severidad: React.Dispatch<React.SetStateAction<CriteriosSeveridad>>;
  borrador_sdca: MapaPilaresSdca;
  on_cambiar_sdca: React.Dispatch<React.SetStateAction<MapaPilaresSdca>>;
  borrador_estatus_qir: EstatusReporteIncidente;
  on_cambiar_estatus_qir: (valor: EstatusReporteIncidente) => void;
  on_cerrar_modal: () => void;
  on_guardar_cambios: () => void;
}

export function ModalEditarSeveridad({
  registro_en_edicion,
  borrador_severidad,
  on_cambiar_severidad,
  borrador_sdca,
  on_cambiar_sdca,
  borrador_estatus_qir,
  on_cambiar_estatus_qir,
  on_cerrar_modal,
  on_guardar_cambios,
}: PropiedadesModalEditarSeveridad) {
  const calculo_severidad = calcular_puntaje_severidad(borrador_severidad);

  return (
    <Dialog
      open={Boolean(registro_en_edicion)}
      onOpenChange={(abierto) => !abierto && on_cerrar_modal()}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-4">
            <span>Evaluación de Matriz de Severidad y Ciclo SDCA</span>
            <Badge
              className={
                calculo_severidad.es_incidente
                  ? "bg-rose-600 text-white text-sm px-3 py-1"
                  : "bg-emerald-600 text-white text-sm px-3 py-1"
              }
            >
              {calculo_severidad.porcentaje_severidad} pts ·{" "}
              {calculo_severidad.clasificacion.toUpperCase()}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            #{registro_en_edicion?.numero_consecutivo} ·{" "}
            {registro_en_edicion?.descripcion_falla} (
            {registro_en_edicion?.nombre_responsable})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2 max-h-[62vh] overflow-y-auto pr-1">
          <SelectoresSeveridadYSdca
            criterios_severidad={borrador_severidad}
            on_alternar_criterio={(clave) =>
              on_cambiar_severidad((previo) => ({
                ...previo,
                [clave]: !previo[clave],
              }))
            }
            pilares_sdca={borrador_sdca}
            on_alternar_pilar={(clave) =>
              on_cambiar_sdca((previo) => ({
                ...previo,
                [clave]: !previo[clave],
              }))
            }
          />

          {calculo_severidad.es_incidente && (
            <div className="p-3 rounded-lg border border-rose-400 bg-rose-500/10 flex items-center justify-between">
              <div className="text-xs">
                <div className="font-bold text-rose-600">
                  ¡Alerta de Incidente de Proceso! (Puntaje ≥ 100)
                </div>
                <div className="text-muted-foreground">
                  ¿Se generó y envió el Reporte de Incidente (QIR)?
                </div>
              </div>
              <select
                value={borrador_estatus_qir}
                onChange={(e) =>
                  on_cambiar_estatus_qir(
                    e.target.value as EstatusReporteIncidente,
                  )
                }
                className="h-8 rounded-md border bg-background px-2 text-xs font-bold"
              >
                <option value="PENDIENTE">PENDIENTE</option>
                <option value="ENVIADO">ENVIADO</option>
              </select>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={on_cerrar_modal}>
            Cancelar
          </Button>
          <Button
            onClick={on_guardar_cambios}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Guardar Cambios
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
