/**
 * @fileoverview Single row component for the Master Severity Matrix BD table.
 */

import { Calculator } from "lucide-react";
import { CATALOGO_PILARES_SDCA } from "@/domain/constants/usabilidad_catalogs";
import type { RegistroAnalisis5WRda } from "@/domain/models/usabilidad/usabilidad_types";
import { Badge } from "@/shared/ui/badge";
import { Button } from "@/shared/ui/button";

interface PropiedadesFilaMatrizSeveridad {
  registro: RegistroAnalisis5WRda;
  on_abrir_editar_severidad: (registro: RegistroAnalisis5WRda) => void;
}

/** Renders an evaluated precursor/incident row with activated SDCA pillars and edit action. */
export function TabMatrizSeveridadRow({
  registro,
  on_abrir_editar_severidad,
}: PropiedadesFilaMatrizSeveridad) {
  const pilares_activos = CATALOGO_PILARES_SDCA.filter((pilar) =>
    Boolean(registro.pilares_sdca[pilar.clave]),
  );

  return (
    <tr className="hover:bg-muted/50">
      <td className="py-2 px-2.5 whitespace-nowrap font-mono">
        <div className="font-bold">#{registro.numero_consecutivo}</div>
        <div className="text-[11px] text-muted-foreground">
          {registro.fecha_evento} (S{registro.semana_evento})
        </div>
      </td>
      <td className="py-2 px-2.5 whitespace-nowrap">
        <Badge variant="outline" className="font-bold">
          {registro.tipo_herramienta}
        </Badge>
        <div className="text-[10px] font-semibold text-blue-600 dark:text-blue-400 mt-0.5">
          {registro.kpi_afectado}
        </div>
      </td>
      <td className="py-2 px-2.5">
        <div className="font-semibold line-clamp-2">{registro.descripcion_falla}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">
          👤 {registro.nombre_responsable}
        </div>
      </td>
      <td className="py-2 px-2.5">
        <div className="font-bold text-[11px]">{registro.area_operativa}</div>
        <div className="text-[11px]">{registro.proceso_cervecero}</div>
        <div className="text-[10px] text-muted-foreground">{registro.equipo_afectado}</div>
      </td>
      <td className="py-2 px-2.5">
        <Badge variant="secondary" className="text-[10px]">
          {registro.marca_cerveza}
        </Badge>
        <div className="text-[11px] mt-0.5 font-medium">{registro.variable_afectada}</div>
      </td>
      <td className="py-2 px-2.5">
        {pilares_activos.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {pilares_activos.map((pilar) => (
              <Badge
                key={pilar.clave}
                className="bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-400/30 text-[10px]"
              >
                {pilar.etiqueta_corta}
              </Badge>
            ))}
          </div>
        ) : (
          <span className="text-muted-foreground text-[11px]">Sin marcar</span>
        )}
      </td>
      <td className="py-2 px-2.5 text-center font-mono font-extrabold text-sm">
        <span
          className={
            registro.porcentaje_severidad >= 100
              ? "text-rose-600"
              : registro.porcentaje_severidad >= 50
                ? "text-amber-600"
                : "text-muted-foreground"
          }
        >
          {registro.porcentaje_severidad} pts
        </span>
      </td>
      <td className="py-2 px-2.5 text-center">
        {registro.clasificacion_incidente === "Incidente" ? (
          <div>
            <Badge className="bg-rose-600 text-white font-bold">INCIDENTE</Badge>
            <div className="text-[10px] font-semibold text-rose-600 mt-0.5">
              Reporte: {registro.estatus_reporte_incidente}
            </div>
          </div>
        ) : (
          <Badge
            variant="outline"
            className="border-emerald-500/60 text-emerald-700 dark:text-emerald-400"
          >
            Precursor
          </Badge>
        )}
      </td>
      <td className="py-2 px-2.5 text-center">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 text-xs"
          onClick={() => on_abrir_editar_severidad(registro)}
        >
          <Calculator className="size-3.5 mr-1" />
          Severidad
        </Button>
      </td>
    </tr>
  );
}
