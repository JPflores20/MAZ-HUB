import React from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { GopThemeItem } from "@/data/pdca";

export interface TemaGopExtendido extends GopThemeItem {
  mesesValues?: string[];
  mesesColors?: string[];
  fechaCompromiso?: string;
  porcentajeAvance?: string;
  focusType?: string;
}

interface PropiedadesFilaGop {
  registroGop: TemaGopExtendido;
  indiceFila: number;
  alActualizarCampo: (idFila: number, campoModificado: string, nuevoValor: any) => void;
  alAlternarMes: (idFila: number, indiceMes: number) => void;
  alActualizarValorMes: (idFila: number, indiceMes: number, valorMes: string) => void;
  alEliminarFila: (idFila: number) => void;
  listaMeses: string[];
  mapaColoresEstado: Record<string, string>;
}

export function FilaTemaGop({
  registroGop,
  indiceFila,
  alActualizarCampo,
  alAlternarMes,
  alActualizarValorMes,
  alEliminarFila,
  listaMeses,
  mapaColoresEstado,
}: PropiedadesFilaGop) {
  const fechaSeleccionada =
    registroGop.fechaCompromiso ||
    (registroGop as any).fecha_compromiso ||
    (registroGop as any).fecha ||
    "";
  const porcentajeAvance =
    registroGop.porcentajeAvance !== undefined && registroGop.porcentajeAvance !== null
      ? String(registroGop.porcentajeAvance)
      : (registroGop as any).porcentaje_avance !== undefined && (registroGop as any).porcentaje_avance !== null
        ? String((registroGop as any).porcentaje_avance)
        : (registroGop as any).avance !== undefined && (registroGop as any).avance !== null
          ? String((registroGop as any).avance)
          : "";
  const focusItems =
    registroGop.focusItems !== undefined && registroGop.focusItems !== null
      ? String(registroGop.focusItems)
      : (registroGop as any).focus_items !== undefined && (registroGop as any).focus_items !== null
        ? String((registroGop as any).focus_items)
        : "";
  const focusType = registroGop.focusType || (registroGop as any).focus_type || "#";
  const status = registroGop.status || (registroGop as any).estado || (registroGop as any).estatus || "";

  const mesesArray = Array.isArray(registroGop.meses)
    ? registroGop.meses
    : (registroGop.meses && typeof registroGop.meses === "object"
        ? Object.values(registroGop.meses)
        : Array(12).fill(false));

  const estaRetrasado =
    fechaSeleccionada &&
    porcentajeAvance !== undefined &&
    new Date(fechaSeleccionada + "T00:00:00") < new Date(new Date().setHours(0, 0, 0, 0)) &&
    Number(porcentajeAvance || 0) < 100;

  return (
    <tr className="group hover:bg-muted/30">
      <td className="border border-border p-2 text-center font-bold bg-[#0070c0] text-white">
        {indiceFila + 1}
      </td>
      
      <td className="border border-border p-0">
        <Textarea
          value={registroGop.tema}
          onChange={(eventoCajaTexto) => alActualizarCampo(registroGop.id, "tema", eventoCajaTexto.target.value)}
          className="border-0 focus-visible:ring-0 resize-none min-h-[60px] rounded-none bg-transparent text-justify overflow-hidden"
          style={{ overflow: "hidden" }}
          placeholder="Describe el tema..."
        />
      </td>

      {mesesArray.map((mesActivo, indiceMesActual) => {
        const valorPorcentajeMes =
          registroGop.mesesValues?.[indiceMesActual] ??
          (registroGop as any).meses_values?.[indiceMesActual] ??
          "100%";
        const colorFondoMes =
          registroGop.mesesColors?.[indiceMesActual] ??
          (registroGop as any).meses_colors?.[indiceMesActual] ??
          "red";
        
        let claseFondoMes = "bg-transparent hover:bg-secondary";
        if (mesActivo) {
          claseFondoMes = colorFondoMes === "green" ? "bg-[#00b050]" : "bg-[#c00000]";
        }

        return (
          <td
            key={indiceMesActual}
            className={cn("border border-border p-0 cursor-pointer transition-colors duration-200", claseFondoMes)}
            onClick={() => alAlternarMes(registroGop.id, indiceMesActual)}
          >
            <div className="w-10 h-full min-h-[60px] flex items-center justify-center">
              {mesActivo && (
                <Input
                  value={valorPorcentajeMes}
                  onChange={(eventoInput) => alActualizarValorMes(registroGop.id, indiceMesActual, eventoInput.target.value)}
                  onClick={(eventoClic) => eventoClic.stopPropagation()}
                  className="h-8 w-full text-center text-white font-bold text-[10px] bg-transparent border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-white/70"
                />
              )}
            </div>
          </td>
        );
      })}

      <td className="border border-border p-1 align-top">
        <Input
          type="date"
          value={fechaSeleccionada}
          onChange={(eventoInputFecha) => alActualizarCampo(registroGop.id, "fechaCompromiso", eventoInputFecha.target.value)}
          className="h-8 text-xs px-1 border-0 shadow-none bg-transparent"
        />
      </td>

      <td className="border border-border p-1 text-center relative align-top">
        <div className="flex items-center justify-center h-8">
          <Input
            type="number"
            value={porcentajeAvance}
            onChange={(eventoInputNumero) => alActualizarCampo(registroGop.id, "porcentajeAvance", eventoInputNumero.target.value)}
            className="h-full w-16 text-center text-xs border-0 shadow-none bg-transparent hide-arrows px-1"
            placeholder="0"
          />
          <span className="text-xs text-muted-foreground ml-1">%</span>
        </div>
        {estaRetrasado && (
          <div className="mt-1">
            <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase">
              Retrasado
            </span>
          </div>
        )}
      </td>

      <td className="border border-border p-0 align-top">
        <div className="flex h-full min-h-[60px] items-center">
          <select
            value={focusType}
            onChange={(eventoSelector) => alActualizarCampo(registroGop.id, "focusType", eventoSelector.target.value)}
            className="border-0 bg-transparent text-xs w-10 text-center focus-visible:ring-0 cursor-pointer outline-none font-bold"
          >
            <option value="#">#</option>
            <option value="%">%</option>
          </select>
          <Input
            value={focusItems}
            onChange={(eventoInput) => alActualizarCampo(registroGop.id, "focusItems", eventoInput.target.value)}
            className="border-0 focus-visible:ring-0 text-left rounded-none bg-transparent h-full flex-1 px-1"
            placeholder="Valor..."
          />
        </div>
      </td>

      <td className="border border-border p-1">
        <select
          value={status}
          onChange={(eventoSelectorEstado) => alActualizarCampo(registroGop.id, "status", eventoSelectorEstado.target.value)}
          className={cn(
            "w-full h-full min-h-[52px] text-xs font-semibold text-center border-0 outline-none cursor-pointer rounded",
            mapaColoresEstado[status] || "bg-transparent",
          )}
        >
          <option value="" className="bg-background text-foreground">Seleccionar...</option>
          <option value="Not Started" className="bg-gray-300 text-gray-800">Not Started</option>
          <option value="In Progress" className="bg-amber-400 text-amber-900">In Progress</option>
          <option value="Complete" className="bg-emerald-500 text-white">Complete</option>
        </select>
      </td>

      <td className="border border-border p-1 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => alEliminarFila(registroGop.id)}
          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
        >
          <X className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
