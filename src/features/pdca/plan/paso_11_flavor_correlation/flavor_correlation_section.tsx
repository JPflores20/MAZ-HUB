/**
 * @fileoverview Sección principal del Paso 11 (Análisis de Correlación de Sabores) usando hook dedicado.
 */
import React from "react";
import { StepCard } from "@/shared/ui/step_card";
import {
  COLORES_CUADRANTES_NEGATIVO_DEFECTO,
  COLORES_CUADRANTES_POSITIVO_DEFECTO,
  type ColoresCuadrantes,
  type DatosCorrelacionSabor,
} from "./flavor_correlation_utils";
import { GraficaCorrelacion } from "./flavor_correlation_chart";
import { FlavorCorrelationDialog } from "./flavor_correlation_dialog";
import { use_flavor_correlation_state } from "./use_flavor_correlation_state";

export type FlavorCorrelationData = DatosCorrelacionSabor;

interface PropiedadesSeccionCorrelacion {
  data?: DatosCorrelacionSabor | null | undefined;
  onChange?: ((datos_nuevos: DatosCorrelacionSabor) => void) | undefined;
  onForceSave?: (() => void) | undefined;
  removeNode?: React.ReactNode;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  defaultExpanded?: boolean | undefined;
  title?: string | undefined;
}

/**
 * Orquesta las gráficas de dispersión positiva y negativa junto con el diálogo gestor de puntos.
 */
export function FlavorCorrelationSection({
  data,
  onChange,
  onForceSave,
  removeNode,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  defaultExpanded,
  title = "Correlación",
}: PropiedadesSeccionCorrelacion) {
  const {
    datos_actuales,
    actualizar_datos,
    importar_puntos_a_serie,
    agregar_nueva_serie,
    renombrar_serie,
    eliminar_serie,
    agregar_punto,
    editar_punto,
    eliminar_punto,
  } = use_flavor_correlation_state(data, onChange);

  const colores_positivos: ColoresCuadrantes =
    datos_actuales.positiveQuadrantColors || COLORES_CUADRANTES_POSITIVO_DEFECTO;
  const colores_negativos: ColoresCuadrantes =
    datos_actuales.negativeQuadrantColors || COLORES_CUADRANTES_NEGATIVO_DEFECTO;
  const series_positivas = datos_actuales.seriesList.filter(
    (serie) => serie.type === "positive",
  );
  const series_negativas = datos_actuales.seriesList.filter(
    (serie) => serie.type === "negative",
  );

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      defaultExpanded={defaultExpanded}
      onToggleNa={onToggleNa}
      headerRight={
        <div className="flex items-center gap-2">
          {removeNode}
          <FlavorCorrelationDialog
            series_positivas={series_positivas}
            series_negativas={series_negativas}
            colores_positivos={colores_positivos}
            colores_negativos={colores_negativos}
            al_cambiar_colores_positivos={(colores) =>
              actualizar_datos({ positiveQuadrantColors: colores })
            }
            al_cambiar_colores_negativos={(colores) =>
              actualizar_datos({ negativeQuadrantColors: colores })
            }
            al_agregar_serie={agregar_nueva_serie}
            al_renombrar_serie={renombrar_serie}
            al_agregar_punto={agregar_punto}
            al_eliminar_serie={eliminar_serie}
            al_editar_punto={editar_punto}
            al_eliminar_punto={eliminar_punto}
            al_importar_puntos={importar_puntos_a_serie}
            al_forzar_guardado={onForceSave}
          />
        </div>
      }
    >
      <div className="grid xl:grid-cols-2 gap-6">
        <GraficaCorrelacion
          tituloGrafica={datos_actuales.positiveTitle}
          alCambiarTitulo={(texto) => actualizar_datos({ positiveTitle: texto })}
          seriesDeDatos={series_positivas}
          tipoGrafica="positive"
          coloresCuadrantes={colores_positivos}
          alCambiarColoresCuadrantes={(colores) =>
            actualizar_datos({ positiveQuadrantColors: colores })
          }
        />
        <GraficaCorrelacion
          tituloGrafica={datos_actuales.negativeTitle}
          alCambiarTitulo={(texto) => actualizar_datos({ negativeTitle: texto })}
          seriesDeDatos={series_negativas}
          tipoGrafica="negative"
          coloresCuadrantes={colores_negativos}
          alCambiarColoresCuadrantes={(colores) =>
            actualizar_datos({ negativeQuadrantColors: colores })
          }
        />
      </div>
    </StepCard>
  );
}
