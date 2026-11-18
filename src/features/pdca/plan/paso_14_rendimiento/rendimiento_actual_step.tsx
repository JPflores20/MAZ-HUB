/**
 * @fileoverview Paso 14 del PDCA: Análisis del rendimiento actual del proceso e indicadores PI.
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StepCard } from "@/shared/ui/step_card";
import type { RendimientoActualPiItem } from "@/domain/pdca";
import { StepInstructions } from "../../components/step_instructions";
import { TablaRendimientoActual } from "./rendimiento_actual_table";
import { EvidenciasRendimientoActual } from "./rendimiento_actual_evidences";

interface PropiedadesPasoRendimiento {
  items: RendimientoActualPiItem[];
  onChange?: (nuevos_registros: RendimientoActualPiItem[]) => void;
  image: string | undefined;
  onImageChange?: (nueva_imagen: string | undefined) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
  title?: string;
}

/**
 * Orquesta instrucciones metodológicas, tabla editable de PIs y galería de evidencias SIC.
 */
export const RendimientoActualStep: React.FC<PropiedadesPasoRendimiento> = ({
  items: registros_indicadores,
  onChange: al_cambiar_registros,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  title = "PASO 14: PERFORMANCE ACTUAL DEL PROCESO ( ANÁLISIS DE PIS)",
}) => {
  const { t: translate } = useTranslation();

  const agregar_registro = () => {
    const registro_nuevo: RendimientoActualPiItem = {
      id: crypto.randomUUID(),
      estacionTrabajo: "",
      nombreIndicador: "",
      estadoActual: "",
      puestoResponsable: "",
      herramienta: "",
      ubicacion: "",
      evidencia: "",
    };
    al_cambiar_registros?.([...(registros_indicadores || []), registro_nuevo]);
  };

  const actualizar_registro = (
    registro_id: string,
    campo: keyof RendimientoActualPiItem,
    nuevo_valor: string,
  ) => {
    al_cambiar_registros?.(
      (registros_indicadores || []).map((registro_actual) =>
        registro_actual.id === registro_id
          ? { ...registro_actual, [campo]: nuevo_valor }
          : registro_actual,
      ),
    );
  };

  const eliminar_registro = (registro_id: string) => {
    al_cambiar_registros?.(
      (registros_indicadores || []).filter(
        (registro_actual) => registro_actual.id !== registro_id,
      ),
    );
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>
            Determinar las PI que serán analizadas. Idealmente, estos serán asignados a los
            Operadores o Técnicos en las estaciones de trabajo de los Operadores relevantes.
          </li>
          <li>
            {translate("pdcaPlan.paso14_rendimiento_step_list_pis", "Enumere los PIs a ser rastreados.")}
          </li>
          <li>Prepare los gráficos SIC necesarios (en versión digital o en papel/pizarra).</li>
          <li>
            Incluya planes de reacción para cualquier PI que deban rastrear los
            operadores/técnicos y comunique los SIC a las estaciones impactadas.
          </li>
          <li>Incluya fotos o capturas de cualquier Carta SIC en el espacio de abajo.</li>
          <li>
            Si el equipo PDCA/ITF dará seguimiento a un SIC, utilice la herramienta gráfica apropiada
            y sus datos base.
          </li>
        </ol>
      </StepInstructions>

      <div className="space-y-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button onClick={agregar_registro} variant="outline" size="sm">
              <Plus className="size-4 mr-2" /> Agregar Fila
            </Button>
          </div>

          <TablaRendimientoActual
            registros_indicadores={registros_indicadores || []}
            al_actualizar_registro={actualizar_registro}
            al_eliminar_registro={eliminar_registro}
          />
        </div>

        <EvidenciasRendimientoActual
          registros_indicadores={registros_indicadores || []}
          al_actualizar_registro={actualizar_registro}
        />
      </div>
    </StepCard>
  );
};
