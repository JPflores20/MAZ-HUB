/**
 * @fileoverview Fila editable de cumplimiento mensual y seguimiento de avance para un tema GOP (Paso 15).
 */
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/class_names";
import { extraer_campos_fila_gop, type TemaGopExtendido } from "./gop_themes_helpers";

interface PropiedadesFilaGop {
  registro_gop: TemaGopExtendido;
  indice_fila: number;
  al_actualizar_campo: (fila_id: number, campo: string, valor: unknown) => void;
  al_alternar_mes: (fila_id: number, indice_mes: number) => void;
  al_actualizar_valor_mes: (fila_id: number, indice_mes: number, valor_mes: string) => void;
  al_eliminar_fila: (fila_id: number) => void;
  mapa_colores_estado: Record<string, string>;
}

/**
 * Despliega una fila con los 12 meses interactivos, fecha compromiso, porcentaje de avance y semáforo.
 */
export function FilaTemaGop({
  registro_gop,
  indice_fila,
  al_actualizar_campo,
  al_alternar_mes,
  al_actualizar_valor_mes,
  al_eliminar_fila,
  mapa_colores_estado,
}: PropiedadesFilaGop) {
  const { t: translate } = useTranslation();
  const {
    fecha_compromiso,
    porcentaje_avance,
    focus_items,
    focus_type,
    estatus_fila,
    arreglo_meses,
    esta_retrasado,
  } = extraer_campos_fila_gop(registro_gop);

  return (
    <tr className="group hover:bg-muted/30">
      <td className="border border-border p-2 text-center font-bold bg-[#0070c0] text-white">
        {indice_fila + 1}
      </td>

      <td className="border border-border p-0">
        <Textarea
          value={registro_gop.tema}
          onChange={(evento) => al_actualizar_campo(registro_gop.id, "tema", evento.target.value)}
          className="border-0 focus-visible:ring-0 resize-none min-h-[60px] rounded-none bg-transparent text-justify overflow-hidden"
          placeholder={translate("pdcaPlan.paso15_gop_row_placeholder")}
        />
      </td>

      {arreglo_meses.map((mes_activo, indice_mes) => {
        const valor_porcentaje =
          registro_gop.mesesValues?.[indice_mes] ??
          registro_gop.meses_values?.[indice_mes] ??
          "100%";
        const color_fondo =
          registro_gop.mesesColors?.[indice_mes] ??
          registro_gop.meses_colors?.[indice_mes] ??
          "red";

        let clase_fondo = "bg-transparent hover:bg-secondary";
        if (mes_activo) {
          clase_fondo = color_fondo === "green" ? "bg-[#00b050]" : "bg-[#c00000]";
        }

        return (
          <td
            key={indice_mes}
            className={cn(
              "border border-border p-0 cursor-pointer transition-colors duration-200",
              clase_fondo,
            )}
            onClick={() => al_alternar_mes(registro_gop.id, indice_mes)}
          >
            <div className="w-10 h-full min-h-[60px] flex items-center justify-center">
              {mes_activo && (
                <Input
                  value={valor_porcentaje}
                  onChange={(evento) =>
                    al_actualizar_valor_mes(registro_gop.id, indice_mes, evento.target.value)
                  }
                  onClick={(evento) => evento.stopPropagation()}
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
          value={fecha_compromiso}
          onChange={(evento) =>
            al_actualizar_campo(registro_gop.id, "fechaCompromiso", evento.target.value)
          }
          className="h-8 text-xs px-1 border-0 shadow-none bg-transparent"
        />
      </td>

      <td className="border border-border p-1 text-center relative align-top">
        <div className="flex items-center justify-center h-8">
          <Input
            type="number"
            value={porcentaje_avance}
            onChange={(evento) =>
              al_actualizar_campo(registro_gop.id, "porcentajeAvance", evento.target.value)
            }
            className="h-full w-16 text-center text-xs border-0 shadow-none bg-transparent hide-arrows px-1"
            placeholder="0"
          />
          <span className="text-xs text-muted-foreground ml-1">%</span>
        </div>
        {esta_retrasado && (
          <div className="mt-1">
            <span className="text-[9px] font-bold bg-red-100 text-red-600 px-1 py-0.5 rounded uppercase">
              {translate("pdcaPlan.paso15_gop_row_delayed")}
            </span>
          </div>
        )}
      </td>

      <td className="border border-border p-0 align-top">
        <div className="flex h-full min-h-[60px] items-center">
          <select
            value={focus_type}
            onChange={(evento) =>
              al_actualizar_campo(registro_gop.id, "focusType", evento.target.value)
            }
            className="border-0 bg-transparent text-xs w-10 text-center focus-visible:ring-0 cursor-pointer outline-none font-bold"
          >
            <option value="#">#</option>
            <option value="%">%</option>
          </select>
          <Input
            value={focus_items}
            onChange={(evento) =>
              al_actualizar_campo(registro_gop.id, "focusItems", evento.target.value)
            }
            className="border-0 focus-visible:ring-0 text-left rounded-none bg-transparent h-full flex-1 px-1"
            placeholder="Valor..."
          />
        </div>
      </td>

      <td className="border border-border p-1">
        <select
          value={estatus_fila}
          onChange={(evento) => al_actualizar_campo(registro_gop.id, "status", evento.target.value)}
          className={cn(
            "w-full h-full min-h-[52px] text-xs font-semibold text-center border-0 outline-none cursor-pointer rounded",
            mapa_colores_estado[estatus_fila] || "bg-transparent",
          )}
        >
          <option value="" className="bg-background text-foreground">
            {translate("pdcaPlan.paso15_gop_row_select")}
          </option>
          <option value="Not Started" className="bg-gray-300 text-gray-800">
            Not Started
          </option>
          <option value="In Progress" className="bg-amber-400 text-amber-900">
            In Progress
          </option>
          <option value="Complete" className="bg-emerald-500 text-white">
            Complete
          </option>
        </select>
      </td>

      <td className="border border-border p-1 text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => al_eliminar_fila(registro_gop.id)}
          className="opacity-0 group-hover:opacity-100 h-8 w-8 text-destructive"
        >
          <X className="size-4" />
        </Button>
      </td>
    </tr>
  );
}
