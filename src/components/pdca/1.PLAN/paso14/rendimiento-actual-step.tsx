import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import type { RendimientoActualPiItem } from "@/data/pdca";
import { TablaRendimientoActual } from "./rendimiento-actual-table";
import { EvidenciasRendimientoActual } from "./rendimiento-actual-evidences";

interface PropiedadesPasoRendimiento {
  items: RendimientoActualPiItem[];
  onChange?: (nuevosRegistros: RendimientoActualPiItem[]) => void;
  image: string | undefined;
  onImageChange?: (nuevaImagen: string | undefined) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
  title?: string;
}

export const RendimientoActualStep: React.FC<PropiedadesPasoRendimiento> = ({
  items: registrosIndicadores,
  onChange: alCambiarRegistros,
  isStepCompleted: pasoEstaCompletado,
  isNa: pasoEsNoAplica,
  onToggleStep: alAlternarEstadoPaso,
  onToggleNa: alAlternarNoAplica,
  title = "PASO 14: PERFORMANCE ACTUAL DEL PROCESO ( ANÁLISIS DE PIS)",
}) => {
  const manejarAgregarRegistroNuevo = () => {
    const registroEstructuraNueva: RendimientoActualPiItem = {
      id: crypto.randomUUID(),
      estacionTrabajo: "",
      nombreIndicador: "",
      estadoActual: "",
      puestoResponsable: "",
      herramienta: "",
      ubicacion: "",
      evidencia: "",
    };
    alCambiarRegistros?.([...(registrosIndicadores || []), registroEstructuraNueva]);
  };

  const manejarActualizacionRegistro = (idRegistroAsociado: string, campoModificado: keyof RendimientoActualPiItem, nuevoValorModificado: string) => {
    const listaRegistrosActualizada = (registrosIndicadores || []).map((registroItem) =>
      registroItem.id === idRegistroAsociado ? { ...registroItem, [campoModificado]: nuevoValorModificado } : registroItem
    );
    alCambiarRegistros?.(listaRegistrosActualizada);
  };

  const manejarEliminacionRegistro = (idRegistroEliminar: string) => {
    alCambiarRegistros?.((registrosIndicadores || []).filter((registroItem) => registroItem.id !== idRegistroEliminar));
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={pasoEstaCompletado}
      onToggleStep={alAlternarEstadoPaso}
      isNa={pasoEsNoAplica}
      onToggleNa={alAlternarNoAplica}
    >
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Determinar las PI que serán analizadas. Idealmente, estos serán asignados a los Operadores o Técnicos en las estaciones de trabajo de los Operadores relevantes. En algunos casos, puede tener sentido que el equipo pdca/ITF rastree un PI en particular.</li>
          <li>Enumere los PIs a ser rastreados.</li>
          <li>Prepare los gráficos SIC necesarios (ya sea en versión digital o en papel/pizarra).</li>
          <li>Incluya planes de reacción para cualquier PI que deban rastrear los operadores/técnicos. Comunicar los SIC a las estaciones de trabajo impactadas, explicando por qué el equipo necesita la ayuda del Operador/Técnico para rastrear el PI, cómo debe llenarse el SIC, asegurándose de que se entienda el Plan de Reacción, cualquier información adicional que pueda ser útil, etc.</li>
          <li>Incluya fotos o capturas de pantalla de cualquier Carta SIC del Operador/Técnico en el espacio de abajo.</li>
          <li>Si el equipo del pdca/ITF va a realizar el seguimiento de un SIC, utilice cualquier herramienta gráfica apropiada disponible aquí en Excel y el espacio en esta pestaña para el gráfico, así como los datos en bruto.</li>
        </ol>
      </StepInstructions>

      <div className="space-y-6 mt-4">
        <div className="space-y-4">
          <div className="flex items-center justify-end">
            <Button onClick={manejarAgregarRegistroNuevo} variant="outline" size="sm">
              <Plus className="size-4 mr-2" /> Agregar Fila
            </Button>
          </div>

          <TablaRendimientoActual 
            registrosIndicadores={registrosIndicadores || []} 
            alActualizarRegistro={manejarActualizacionRegistro} 
            alEliminarRegistro={manejarEliminacionRegistro} 
          />
        </div>

        <EvidenciasRendimientoActual 
          registrosIndicadores={registrosIndicadores || []} 
          alActualizarRegistro={manejarActualizacionRegistro} 
        />
      </div>
    </StepCard>
  );
};
