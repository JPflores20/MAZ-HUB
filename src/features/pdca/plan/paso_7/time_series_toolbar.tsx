/**
 * @fileoverview Barra de controles para unidad de medida, límites del eje Y y plantillas en series YTD.
 */
import { useTranslation } from "react-i18next";
import { Input } from "@/shared/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ElementoSerieTemporal } from "./time_series_table";
import { OPCIONES_PLANTILLAS_SEMANA, generar_plantilla_serie } from "./time_series_templates";

interface PropiedadesBarraHerramientasSeries {
  unidad_medida: string;
  al_cambiar_unidad?: ((nueva_unidad: string) => void) | undefined;
  minimo_eje_y: number;
  al_cambiar_minimo_y?: ((nuevo_minimo: number) => void) | undefined;
  maximo_eje_y: string;
  al_cambiar_maximo_y?: ((nuevo_maximo: string) => void) | undefined;
  al_cambiar_serie?: ((nueva_serie: ElementoSerieTemporal[]) => void) | undefined;
}

/**
 * Despliega campos de unidad, escala Y (mínimo/máximo) y selector de plantilla mensual o semanal.
 */
export function TimeSeriesToolbar({
  unidad_medida,
  al_cambiar_unidad,
  minimo_eje_y,
  al_cambiar_minimo_y,
  maximo_eje_y,
  al_cambiar_maximo_y,
  al_cambiar_serie,
}: PropiedadesBarraHerramientasSeries) {
  const { t: translate } = useTranslation();

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {translate("pdcaPlan.dynamic.unidadDeMedida2")}
          </span>
          <Input
            value={unidad_medida}
            onChange={(evento) => al_cambiar_unidad?.(evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.ejHl")}
            className="w-28 h-7 text-xs font-bold"
          />
        </div>
        <div className="hidden md:flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {translate("pdcaPlan.dynamic.ejeY")}
          </span>
          <span className="text-xs text-muted-foreground">{translate("pdcaPlan.dynamic.min")}</span>
          <Input
            type="number"
            value={minimo_eje_y}
            onChange={(evento) => al_cambiar_minimo_y?.(Number(evento.target.value))}
            className="w-20 h-7 text-xs"
          />
          <span className="text-xs text-muted-foreground">{translate("pdcaPlan.dynamic.max")}</span>
          <Input
            type="text"
            value={maximo_eje_y}
            onChange={(evento) => al_cambiar_maximo_y?.(evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.auto")}
            className="w-20 h-7 text-xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {translate("pdcaPlan.dynamic.plantillaRPida")}
        </span>
        <Select
          onValueChange={(opcion_seleccionada) => {
            if (
              window.confirm(
                "Cambiar la plantilla reemplazará los datos actuales en la tabla. ¿Deseas continuar?",
              )
            ) {
              const serie_plantilla = generar_plantilla_serie(opcion_seleccionada);
              if (serie_plantilla.length > 0) al_cambiar_serie?.(serie_plantilla);
            }
          }}
        >
          <SelectTrigger className="h-7 text-xs w-[180px] bg-secondary/30">
            <SelectValue placeholder={translate("pdcaPlan.dynamic.elegir")} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meses">{translate("pdcaPlan.dynamic.12MesesAnual")}</SelectItem>
            {OPCIONES_PLANTILLAS_SEMANA.map((opcion_plantilla) => (
              <SelectItem key={opcion_plantilla.valor} value={opcion_plantilla.valor}>
                {translate(opcion_plantilla.clave_i18n)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
