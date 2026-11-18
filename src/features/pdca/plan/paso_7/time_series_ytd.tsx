/**
 * @fileoverview Paso 7 / 24 del PDCA: Contenedor de Situación Actual e histórico anual Target vs. Actual.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { DEFAULT_TARGET_VS_ACTUAL } from "@/domain/pdca";
import { StepCard } from "@/shared/ui/step_card";
import { StepInstructions } from "../../components/step_instructions";
import { TablaSeries, type ElementoSerieTemporal } from "./time_series_table";
import { GraficaSeries } from "./time_series_chart";
import { TimeSeriesToolbar } from "./time_series_toolbar";

interface PropiedadesSeriesTiempo {
  value?: ElementoSerieTemporal[] | undefined;
  onChange?: ((nueva_serie: ElementoSerieTemporal[]) => void) | undefined;
  unit?: string | undefined;
  onUnitChange?: ((nueva_unidad: string) => void) | undefined;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  title?: string | undefined;
  chartTitle?: string | undefined;
  onTitleChange?: ((nuevo_titulo: string) => void) | undefined;
  customBadge?: React.ReactNode;
  yMin?: number | undefined;
  onYMinChange?: ((nuevo_minimo: number) => void) | undefined;
  yMax?: string | undefined;
  onYMaxChange?: ((nuevo_maximo: string) => void) | undefined;
}

/**
 * Combina tabla editable, barra de escala/plantillas y gráfica compuesta YTD.
 */
export function TimeSeriesYTD({
  value: serie_actual,
  onChange: al_cambiar_serie,
  unit: unidad_medida = "$",
  onUnitChange: al_cambiar_unidad,
  isStepCompleted: paso_completado,
  isNa: paso_no_aplica,
  onToggleStep: al_alternar_paso,
  onToggleNa: al_alternar_no_aplica,
  title: titulo_paso = "PASO 3: SITUACIÓN ACTUAL",
  chartTitle: titulo_grafica = "SITUACIÓN ACTUAL",
  onTitleChange: al_cambiar_titulo_grafica,
  customBadge: medalla_personalizada,
  yMin: minimo_eje_y = 0,
  onYMinChange: al_cambiar_minimo_y,
  yMax: maximo_eje_y = "auto",
  onYMaxChange: al_cambiar_maximo_y,
}: PropiedadesSeriesTiempo) {
  const { t: translate } = useTranslation();

  const datos_series =
    serie_actual && serie_actual.length > 0 ? serie_actual : DEFAULT_TARGET_VS_ACTUAL;
  const maximo_eje_y_calculado =
    String(maximo_eje_y).trim() === "auto" || String(maximo_eje_y).trim() === ""
      ? "auto"
      : Number(maximo_eje_y);

  const actualizar_campo_fila = (
    indice_objetivo: number,
    cambios: Partial<ElementoSerieTemporal>,
  ) => {
    al_cambiar_serie?.(
      datos_series.map((item_serie, indice_actual) =>
        indice_actual === indice_objetivo ? { ...item_serie, ...cambios } : item_serie,
      ),
    );
  };

  const eliminar_fila = (indice_a_eliminar: number) => {
    if (datos_series.length <= 1) return;
    al_cambiar_serie?.(
      datos_series.filter((_item, indice_actual) => indice_actual !== indice_a_eliminar),
    );
  };

  const meta_ytd =
    datos_series.length > 0
      ? datos_series.reduce((suma, item_serie) => suma + (item_serie.target || 0), 0) /
        datos_series.length
      : 0;

  const reales_filtrados = datos_series.filter(
    (item_serie) => item_serie.actual !== null && item_serie.actual !== undefined,
  );
  const actual_ytd =
    reales_filtrados.length > 0
      ? reales_filtrados.reduce((suma, item_serie) => suma + (item_serie.actual || 0), 0) /
        reales_filtrados.length
      : 0;

  const datos_completos_grafica = [
    ...datos_series.map((item_serie) => ({
      name: item_serie.mes,
      metaLine: item_serie.target,
      actualLine: item_serie.actual,
      ytdTargetBar: null,
      ytdActualBar: null,
    })),
    { name: "YTD Target", metaLine: null, actualLine: null, ytdTargetBar: meta_ytd, ytdActualBar: null },
    { name: "YTD Actual", metaLine: null, actualLine: null, ytdTargetBar: null, ytdActualBar: actual_ytd },
  ];

  const formatear_valor_visual = (valor_entrada: number | null | undefined): string => {
    if (valor_entrada === null || valor_entrada === undefined || Number.isNaN(valor_entrada)) {
      return "";
    }
    const texto_numerico = Number(valor_entrada).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (unidad_medida === "$") return `$${texto_numerico}`;
    if (!unidad_medida) return texto_numerico;
    return unidad_medida === "%" ? `${texto_numerico}%` : `${texto_numerico} ${unidad_medida}`;
  };

  return (
    <StepCard
      className="col-span-full"
      title={titulo_paso}
      isStepCompleted={paso_completado}
      onToggleStep={al_alternar_paso}
      headerRight={medalla_personalizada}
      isNa={paso_no_aplica}
      onToggleNa={al_alternar_no_aplica}
    >
      <StepInstructions>
        <p className="mb-1">{translate("pdcaPlan.dynamic.1RellenaElCampoGris")}</p>
        <p className="mb-1">{translate("pdcaPlan.dynamic.2CompletaElPerOdo")}</p>
        <p>{translate("pdcaPlan.dynamic.3RellenaLasColumnasObjetivo")}</p>
      </StepInstructions>

      <TimeSeriesToolbar
        unidad_medida={unidad_medida}
        al_cambiar_unidad={al_cambiar_unidad}
        minimo_eje_y={minimo_eje_y}
        al_cambiar_minimo_y={al_cambiar_minimo_y}
        maximo_eje_y={maximo_eje_y}
        al_cambiar_maximo_y={al_cambiar_maximo_y}
        al_cambiar_serie={al_cambiar_serie}
      />

      <div className="flex flex-col xl:flex-row gap-6 mt-4">
        <TablaSeries
          datos_series={datos_series}
          meta_ytd={meta_ytd}
          actual_ytd={actual_ytd}
          formatear_valor={formatear_valor_visual}
          al_actualizar_mes={(indice, nuevo_mes) =>
            actualizar_campo_fila(indice, { mes: nuevo_mes })
          }
          al_actualizar_meta={(indice, nuevo_valor) =>
            actualizar_campo_fila(indice, { target: nuevo_valor === "" ? 0 : Number(nuevo_valor) })
          }
          al_actualizar_actual={(indice, nuevo_valor) =>
            actualizar_campo_fila(indice, {
              actual: nuevo_valor === "" ? null : Number(nuevo_valor),
            })
          }
          al_agregar_fila={() =>
            al_cambiar_serie?.([...datos_series, { mes: "Nuevo", target: 0, actual: null }])
          }
          al_eliminar_fila={eliminar_fila}
        />

        <GraficaSeries
          datos_grafica={datos_completos_grafica}
          formatear_valor={formatear_valor_visual}
          titulo_grafica={titulo_grafica}
          al_cambiar_titulo_grafica={al_cambiar_titulo_grafica}
          minimo_eje_y={minimo_eje_y}
          maximo_eje_y={maximo_eje_y_calculado}
        />
      </div>
    </StepCard>
  );
}
