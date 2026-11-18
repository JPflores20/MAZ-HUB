/**
 * @fileoverview Interactive 5W quality rubric evaluation dialog (7 Interaction Log VPO criteria).
 */

import type React from "react";
import { calcular_puntaje_rubrica_5w } from "@/domain/calculators/usabilidad_calculators";
import { PREGUNTAS_RUBRICA_5W } from "@/domain/constants/usabilidad_catalogs";
import type {
  RegistroAnalisis5WRda,
  RubricaCalidad5W,
} from "@/domain/models/usabilidad/usabilidad_types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/ui/dialog";
import { Label } from "@/shared/ui/label";
import { Textarea } from "@/shared/ui/textarea";

interface PropiedadesModalRubrica5W {
  registro_en_evaluacion: RegistroAnalisis5WRda | null;
  borrador_rubrica: RubricaCalidad5W;
  on_cambiar_borrador: React.Dispatch<React.SetStateAction<RubricaCalidad5W>>;
  on_cerrar_modal: () => void;
  on_guardar_rubrica: () => void;
}

/** Modal dialog to score the 7 quality criteria and improvement feedback for a 5W record. */
export function ModalEvaluarRubrica5W({
  registro_en_evaluacion,
  borrador_rubrica,
  on_cambiar_borrador,
  on_cerrar_modal,
  on_guardar_rubrica,
}: PropiedadesModalRubrica5W) {
  const porcentaje_borrador =
    Math.round(calcular_puntaje_rubrica_5w(borrador_rubrica) * 1000) / 10;

  return (
    <Dialog
      open={Boolean(registro_en_evaluacion)}
      onOpenChange={(abierto) => !abierto && on_cerrar_modal()}
    >
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between pr-4">
            <span>Auditoría de Calidad 5W (Rúbrica Interaction Log)</span>
            <Badge
              className={
                porcentaje_borrador >= 85
                  ? "bg-emerald-600 text-white text-sm px-3 py-1"
                  : porcentaje_borrador >= 70
                    ? "bg-blue-600 text-white text-sm px-3 py-1"
                    : "bg-rose-600 text-white text-sm px-3 py-1"
              }
            >
              Calificación: {porcentaje_borrador}%
            </Badge>
          </DialogTitle>
          <DialogDescription>
            {registro_en_evaluacion?.id_ial ? `ID IAL: ${registro_en_evaluacion.id_ial} · ` : ""}
            {registro_en_evaluacion?.descripcion_falla} (
            {registro_en_evaluacion?.nombre_responsable})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2 max-h-[60vh] overflow-y-auto pr-1">
          {PREGUNTAS_RUBRICA_5W.map((pregunta) => {
            const esta_marcado = Boolean(borrador_rubrica[pregunta.clave]);
            return (
              <div
                key={pregunta.clave}
                onClick={() =>
                  on_cambiar_borrador((previo) => ({
                    ...previo,
                    [pregunta.clave]: !previo[pregunta.clave],
                  }))
                }
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                  esta_marcado
                    ? "bg-emerald-50/60 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800"
                    : "bg-rose-50/50 border-rose-300 dark:bg-rose-950/20 dark:border-rose-800"
                }`}
              >
                <Checkbox
                  checked={esta_marcado}
                  onCheckedChange={(valor_checkbox) =>
                    on_cambiar_borrador((previo) => ({
                      ...previo,
                      [pregunta.clave]: Boolean(valor_checkbox),
                    }))
                  }
                  className="mt-0.5"
                />
                <div className="flex-1 text-xs">
                  <div className="font-bold text-foreground">{pregunta.titulo_corto}</div>
                  <div className="text-muted-foreground mt-0.5">
                    {pregunta.descripcion_completa}
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={
                    esta_marcado
                      ? "border-emerald-600 text-emerald-700 font-bold"
                      : "border-rose-600 text-rose-700 font-bold"
                  }
                >
                  {esta_marcado ? "Ok" : "NO ESTÁ BIEN"}
                </Badge>
              </div>
            );
          })}

          <div className="space-y-1.5 pt-2">
            <Label className="text-xs font-bold uppercase">
              Comentarios para mejoras (Retroalimentación al responsable)
            </Label>
            <Textarea
              placeholder="Ej. Faltan acciones preventivas para evitar recurrencia y estandarizar en SOP/OPL..."
              value={borrador_rubrica.comentarios_mejora || ""}
              onChange={(evento_cambio) =>
                on_cambiar_borrador((previo) => ({
                  ...previo,
                  comentarios_mejora: evento_cambio.target.value,
                }))
              }
              rows={3}
              className="text-xs"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={on_cerrar_modal}>
            Cancelar
          </Button>
          <Button onClick={on_guardar_rubrica} className="bg-blue-600 hover:bg-blue-700 text-white">
            Guardar Calificación ({porcentaje_borrador}%)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
