/**
 * @fileoverview Fila editable de análisis de riesgo con cálculo automático de RPN y semáforo visual.
 */
import React from "react";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { TableCell, TableRow } from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { AnalisisRiesgoItem } from "@/domain/pdca";

interface PropiedadesFilaRiesgo {
  registro_riesgo: AnalisisRiesgoItem;
  indice_fila: number;
  al_actualizar_campo: (
    riesgo_id: string,
    campo: keyof AnalisisRiesgoItem,
    valor: string,
  ) => void;
  al_eliminar: (riesgo_id: string) => void;
}

const calcular_rpn = (probabilidad: string, impacto: string, prioridad: string): number =>
  (parseInt(probabilidad, 10) || 0) *
  (parseInt(impacto, 10) || 0) *
  (parseInt(prioridad, 10) || 0);

const obtener_clase_semaforo = (valor?: string): string => {
  if (valor === "1" || valor === "2") return "bg-green-100 border-green-300 text-green-800 font-medium";
  if (valor === "3") return "bg-orange-100 border-orange-300 text-orange-800 font-medium";
  if (valor === "4") return "bg-red-100 border-red-300 text-red-800 font-medium";
  return "";
};

const obtener_clase_rpn = (rpn: number): string => {
  if (rpn <= 0) return "";
  if (rpn <= 8) return "bg-green-100 text-green-800";
  if (rpn <= 27) return "bg-orange-100 text-orange-800";
  return "bg-red-100 text-red-800";
};

/**
 * Renderiza una fila editable con selectores de escala 1-4, RPN calculado y acciones de mitigación.
 */
export const AnalisisRiesgosRow: React.FC<PropiedadesFilaRiesgo> = ({
  registro_riesgo,
  indice_fila,
  al_actualizar_campo,
  al_eliminar,
}) => {
  const { t: translate } = useTranslation();
  const rpn_calculado = calcular_rpn(
    registro_riesgo.probabilidad,
    registro_riesgo.impacto,
    registro_riesgo.prioridad || "",
  );

  const selectores_escala: {
    campo: "probabilidad" | "impacto" | "prioridad";
    etiqueta_3: string;
  }[] = [
    { campo: "probabilidad", etiqueta_3: translate("pdcaPlan.dynamic.3Medio") },
    { campo: "impacto", etiqueta_3: translate("pdcaPlan.dynamic.3Moderado") },
    { campo: "prioridad", etiqueta_3: translate("pdcaPlan.dynamic.3Medio") },
  ];

  return (
    <TableRow>
      <TableCell className="p-1.5 text-center font-bold">{indice_fila + 1}</TableCell>
      <TableCell className="p-1.5">
        <Input
          value={registro_riesgo.riesgo}
          onChange={(evento) =>
            al_actualizar_campo(registro_riesgo.id, "riesgo", evento.target.value)
          }
          placeholder={translate("pdcaPlan.dynamic.ejFallaDeEquipo")}
          className="h-8 text-xs shadow-none"
        />
      </TableCell>
      <TableCell className="p-1.5">
        <Select
          value={registro_riesgo.tipo_impacto || ""}
          onValueChange={(opcion) =>
            al_actualizar_campo(registro_riesgo.id, "tipo_impacto", opcion)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={translate("pdcaPlan.dynamic.seleccionar")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Scope">{translate("pdcaPlan.dynamic.scopeAlcance")}</SelectItem>
            <SelectItem value="Cost">{translate("pdcaPlan.dynamic.costCosto")}</SelectItem>
            <SelectItem value="Time">{translate("pdcaPlan.dynamic.timeTiempo")}</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      {selectores_escala.map(({ campo, etiqueta_3 }) => (
        <TableCell key={campo} className="p-1.5">
          <Select
            value={registro_riesgo[campo] || ""}
            onValueChange={(opcion) => al_actualizar_campo(registro_riesgo.id, campo, opcion)}
          >
            <SelectTrigger
              className={`h-8 text-xs text-center ${obtener_clase_semaforo(registro_riesgo[campo])}`}
            >
              <SelectValue placeholder="1-4" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">{translate("pdcaPlan.dynamic.1Nada")}</SelectItem>
              <SelectItem value="2">{translate("pdcaPlan.dynamic.2Bajo")}</SelectItem>
              <SelectItem value="3">{etiqueta_3}</SelectItem>
              <SelectItem value="4">{translate("pdcaPlan.dynamic.4Alto")}</SelectItem>
            </SelectContent>
          </Select>
        </TableCell>
      ))}
      <TableCell
        className={`p-1.5 text-center font-bold text-sm ${rpn_calculado > 0 ? `${obtener_clase_rpn(rpn_calculado)} rounded-md border border-black/10` : ""}`}
      >
        {rpn_calculado > 0 ? rpn_calculado : "-"}
      </TableCell>
      <TableCell className="p-1.5">
        <Select
          value={registro_riesgo.mitigacion || ""}
          onValueChange={(opcion) =>
            al_actualizar_campo(registro_riesgo.id, "mitigacion", opcion)
          }
        >
          <SelectTrigger className="h-8 text-xs">
            <SelectValue placeholder={translate("pdcaPlan.dynamic.respuesta")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Accept">{translate("pdcaPlan.dynamic.accept")}</SelectItem>
            <SelectItem value="Avoid">{translate("pdcaPlan.dynamic.avoid")}</SelectItem>
            <SelectItem value="Mitigate">{translate("pdcaPlan.dynamic.mitigate")}</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="p-1.5">
        <Input
          value={registro_riesgo.responsable}
          onChange={(evento) =>
            al_actualizar_campo(registro_riesgo.id, "responsable", evento.target.value)
          }
          placeholder={translate("pdcaPlan.dynamic.responsable3")}
          className="h-8 text-xs shadow-none"
        />
      </TableCell>
      <TableCell className="p-1.5">
        <Input
          type="date"
          value={registro_riesgo.fecha_limite || ""}
          onChange={(evento) =>
            al_actualizar_campo(registro_riesgo.id, "fecha_limite", evento.target.value)
          }
          className="h-8 text-xs shadow-none"
        />
      </TableCell>
      <TableCell className="p-1.5 text-center">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => al_eliminar(registro_riesgo.id)}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
