import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextareaAutosize from "react-textarea-autosize";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { TableCell, TableRow } from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import type { ActionItem } from "@/data/pdca";
import {
  CLAVES_FACTORES,
  OPCIONES_PUNTAJE,
  OPCIONES_ESTADO,
  COLOR_POR_ESTADO,
  obtenerColorDropdown,
  obtenerVisualesImpacto,
} from "../utils/action-plan-utils";

interface PropiedadesFilaAccion {
  fila: ActionItem;
  alActualizar: (id: string, campo: keyof ActionItem, valor: string) => void;
  alEliminar: (id: string) => void;
}

/** Celda de textarea autoexpandible (uso interno) */
const CeldaTextarea: React.FC<{
  valor: string;
  placeholder: string;
  alCambiar: (v: string) => void;
}> = ({ valor, placeholder, alCambiar }) => (
  <TableCell className="p-0 border-r align-top">
    <TextareaAutosize
      value={valor}
      onChange={(e) => alCambiar(e.target.value)}
      placeholder={placeholder}
      minRows={1}
      className="w-full resize-none border-0 shadow-none focus-visible:ring-0 bg-transparent text-xs p-2.5 outline-none min-h-[40px] text-justify overflow-hidden"
      style={{ overflow: "hidden" }}
    />
  </TableCell>
);

/** Celda de select SI/NO (uso interno) */
const CeldaSiNo: React.FC<{
  valor: string;
  alCambiar: (v: string) => void;
  fondo?: string;
}> = ({ valor, alCambiar }) => (
  <TableCell className="p-1 border-r bg-muted/20">
    <div className="h-full flex items-center justify-center">
      <Select value={valor || "-"} onValueChange={(v) => alCambiar(v === "-" ? "" : v)}>
        <SelectTrigger
          className={cn(
            "h-8 text-[11px] font-bold rounded border px-2 shadow-none [&>span]:line-clamp-none",
            valor === "SI"
              ? "bg-[#e6f4ea] text-[#137333] border-[#137333]/30"
              : valor === "NO"
                ? "bg-[#fce8e6] text-[#c5221f] border-[#c5221f]/30"
                : "bg-white border-border",
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
 * Fila individual editable de la Matriz de Impacto y Plan de Acción.
 */
export const FilaAccionPlan: React.FC<PropiedadesFilaAccion> = ({
  fila,
  alActualizar,
  alEliminar,
}) => {
  const actualizarCampo = (campo: keyof ActionItem) => (valor: string) =>
    alActualizar(fila.id, campo, valor);

  const visualesImpacto = obtenerVisualesImpacto(fila);

  return (
    <TableRow className="hover:bg-muted/30">
      <CeldaTextarea valor={fila.tema || ""} placeholder="Tema..." alCambiar={actualizarCampo("tema")} />
      <CeldaTextarea valor={fila.causaRaiz || ""} placeholder="Causa raíz..." alCambiar={actualizarCampo("causaRaiz")} />
      <CeldaTextarea valor={fila.accion || ""} placeholder="Acción..." alCambiar={actualizarCampo("accion")} />

      {/* Factores numéricos de impacto */}
      {CLAVES_FACTORES.map((clave) => {
        const valorCelda = fila[clave] ? String(fila[clave]) : "";
        return (
          <TableCell key={clave} className="p-1 border-r">
            <div className="px-1 h-full flex items-center justify-center">
              <Select
                value={valorCelda || "-"}
                onValueChange={(v) => alActualizar(fila.id, clave, v === "-" ? "" : v)}
              >
                <SelectTrigger
                  className={cn(
                    "h-8 text-[11px] rounded border px-2 shadow-none focus:ring-1 focus:ring-primary [&>span]:line-clamp-none",
                    obtenerColorDropdown(valorCelda),
                  )}
                >
                  <SelectValue placeholder="-" />
                </SelectTrigger>
                <SelectContent>
                  {OPCIONES_PUNTAJE.map((opt) => (
                    <SelectItem key={opt.value || "-"} value={opt.value || "-"}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TableCell>
        );
      })}

      {/* Resultado de impacto calculado */}
      <TableCell className="p-1 border-r">
        <div className="px-1 h-full flex items-center justify-center">
          <div
            className={cn(
              "flex items-center justify-center w-full h-8 text-[11px] rounded border",
              visualesImpacto.color,
            )}
          >
            {visualesImpacto.texto}
          </div>
        </div>
      </TableCell>

      <CeldaSiNo valor={fila.priorizar || ""} alCambiar={actualizarCampo("priorizar")} />
      <CeldaSiNo valor={fila.quickWin || ""} alCambiar={actualizarCampo("quickWin")} />
      <CeldaSiNo valor={fila.technologyRequired || ""} alCambiar={actualizarCampo("technologyRequired")} />

      {/* Comentarios */}
      <TableCell className="p-1 border-r min-w-[180px]">
        <TextareaAutosize
          minRows={1}
          value={fila.comentarios || ""}
          onChange={(e) => alActualizar(fila.id, "comentarios", e.target.value)}
          placeholder="Comentarios..."
          className="w-full text-xs p-2 bg-transparent border-0 resize-none outline-none focus:ring-1 focus:ring-primary rounded"
        />
      </TableCell>

      {/* Responsable */}
      <TableCell className="p-1 border-r min-w-[140px]">
        <Input
          value={fila.responsable || ""}
          onChange={(e) => alActualizar(fila.id, "responsable", e.target.value)}
          placeholder="Responsable..."
          className="h-8 text-[11px] bg-transparent border-0 shadow-none px-2 focus-visible:ring-1 rounded"
        />
      </TableCell>

      {/* Fecha */}
      <TableCell className="p-1 border-r">
        <DatePicker
          date={fila.fecha ? new Date(fila.fecha + "T12:00:00") : undefined}
          setDate={(d) => alActualizar(fila.id, "fecha", d ? format(d, "yyyy-MM-dd") : "")}
          className="h-8 text-[11px] px-2 bg-transparent border-0 shadow-none hover:bg-muted/50 rounded"
          placeholder="-"
        />
      </TableCell>

      {/* Estado */}
      <TableCell className="p-1 border-r">
        <Select value={fila.status} onValueChange={actualizarCampo("status")}>
          <SelectTrigger
            className={cn(
              "h-8 text-[10px] font-semibold rounded border px-2 shadow-none [&>span]:line-clamp-none",
              COLOR_POR_ESTADO[fila.status] ?? "bg-transparent text-muted-foreground border-border",
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {OPCIONES_ESTADO.map((opt) => (
              <SelectItem key={opt} value={opt}>
                {opt}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </TableCell>

      {/* Herramienta SDCA */}
      <TableCell className="p-1 border-r min-w-[100px]">
        <Input
          value={fila.herramientaSdca || ""}
          onChange={(e) => alActualizar(fila.id, "herramientaSdca", e.target.value)}
          placeholder="SDCA..."
          className="h-8 text-[11px] bg-transparent border-0 shadow-none px-2 focus-visible:ring-1 rounded"
        />
      </TableCell>

      {/* Eliminar */}
      <TableCell className="p-1 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => alEliminar(fila.id)}
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
