/**
 * @fileoverview Celdas reutilizables (Textarea autoexpandible, Selector SÍ/NO y Factores de Impacto) para filas del Plan de Acción.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { cn } from "@/shared/utils/class_names";
import { TableCell } from "@/shared/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ActionItem } from "@/domain/pdca";
import {
  CLAVES_FACTORES,
  OPCIONES_PUNTAJE,
  OPCIONES_PUNTAJE_COSTO,
  obtener_color_dropdown,
} from "./action_plan_utils";

/**
 * Celda de texto multilínea autoexpandible sin bordes internos.
 */
export const CeldaTextareaAccion: React.FC<{
  valor: string;
  placeholder: string;
  al_cambiar: (nuevo_texto: string) => void;
}> = ({ valor, placeholder, al_cambiar }) => (
  <TableCell className="p-0 border-r align-top">
    <TextareaAutosize
      value={valor}
      onChange={(evento) => al_cambiar(evento.target.value)}
      placeholder={placeholder}
      minRows={1}
      className="w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-xs p-2.5 outline-none min-h-[40px] text-justify overflow-hidden"
      style={{ overflow: "hidden" }}
    />
  </TableCell>
);

/**
 * Selector binario SÍ / NO codificado por color para priorización, Quick Win y soporte técnico.
 */
export const CeldaSiNoAccion: React.FC<{
  valor: string;
  al_cambiar: (nueva_opcion: string) => void;
}> = ({ valor, al_cambiar }) => (
  <TableCell className="p-1 border-r bg-muted/20">
    <div className="h-full flex items-center justify-center">
      <Select value={valor || "-"} onValueChange={(seleccion) => al_cambiar(seleccion === "-" ? "" : seleccion)}>
        <SelectTrigger
          className={cn(
            "h-8 text-[11px] font-bold rounded border px-2 shadow-none [&>span]:line-clamp-none",
            valor === "SI"
              ? "bg-[#e6f4ea] text-[#137333] border-[#137333]/30"
              : valor === "NO"
                ? "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30"
                : "bg-background text-foreground border-border",
          )}
        >
          <SelectValue placeholder="-" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="-">-</SelectItem>
          <SelectItem value="SI">SÍ</SelectItem>
          <SelectItem value="NO">NO</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </TableCell>
);

/**
 * Renderiza las cinco celdas numéricas de evaluación de impacto (Seguridad, Calidad, Costo, Medio Ambiente, Servicio).
 */
export const CeldaFactoresImpacto: React.FC<{
  fila: ActionItem;
  al_actualizar_factor: (clave_factor: keyof ActionItem, puntaje: string) => void;
}> = ({ fila, al_actualizar_factor }) => {
  const { t: translate } = useTranslation();

  const traducir_puntaje = (etiqueta_cruda: string): string => {
    if (etiqueta_cruda === "5 - Alto") return translate("pdcaDropdowns.alto", "5 - Alto");
    if (etiqueta_cruda === "3 - Medio") return translate("pdcaDropdowns.medio", "3 - Medio");
    if (etiqueta_cruda === "1 - Bajo") return translate("pdcaDropdowns.bajo", "1 - Bajo");
    if (etiqueta_cruda === "5 - Menor costo") {
      return translate("pdcaDropdowns.menorCosto", "5 - Menor costo");
    }
    if (etiqueta_cruda === "1 - Mayor costo") {
      return translate("pdcaDropdowns.mayorCosto", "1 - Mayor costo");
    }
    return etiqueta_cruda;
  };

  return (
    <>
      {CLAVES_FACTORES.map((clave_factor) => {
        const valor_celda = fila[clave_factor] ? String(fila[clave_factor]) : "";
        const lista_opciones =
          clave_factor === "costo" ? OPCIONES_PUNTAJE_COSTO : OPCIONES_PUNTAJE;
        return (
          <TableCell key={clave_factor} className="p-1 border-r">
            <div className="px-1 h-full flex items-center justify-center">
              <Select
                value={valor_celda || "-"}
                onValueChange={(seleccion) =>
                  al_actualizar_factor(clave_factor, seleccion === "-" ? "" : seleccion)
                }
              >
                <SelectTrigger
                  className={cn(
                    "h-8 text-[11px] rounded border px-2 shadow-none focus:ring-1 focus:ring-primary [&>span]:line-clamp-none",
                    obtener_color_dropdown(valor_celda),
                  )}
                >
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {lista_opciones.map((opcion) => (
                    <SelectItem key={opcion.value || "-"} value={opcion.value || "-"}>
                      {traducir_puntaje(opcion.label)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TableCell>
        );
      })}
    </>
  );
};
