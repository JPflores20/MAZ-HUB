/**
 * @fileoverview Diagrama interactivo de Ishikawa 6M con expansión a pantalla completa y matriz de priorización.
 */
import React from "react";
import { Input } from "@/shared/ui/input";
import { StepCard } from "@/shared/ui/step_card";
import { IshikawaDiagramCanvas } from "./ishikawa_diagram_canvas";
import { IshikawaHeaderActions } from "./ishikawa_header_actions";
import { MatrizPriorizacionIshikawa } from "./ishikawa_prioritization_matrix";
import type { CausaPriorizacionIshikawa } from "./ishikawa_prioritization_row";

interface PropiedadesIshikawaInteractivo {
  causasRegistradas: Record<string, string[]>;
  alCambiarCausas: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  efectoPrincipal: string;
  alCambiarEfecto: (nuevo_efecto: string) => void;
  causasPriorizadas?: CausaPriorizacionIshikawa[] | undefined;
  alCambiarCausasPriorizadas?:
    | ((nuevas_causas: CausaPriorizacionIshikawa[]) => void)
    | undefined;
  etiquetasPersonalizadas?: Record<string, string>;
  alCambiarEtiquetas?: (
    nuevas_etiquetas:
      | Record<string, string>
      | ((previas: Record<string, string>) => Record<string, string>),
  ) => void;
  sufijoTitulo?: string | undefined;
  tituloPersonalizado?: string | undefined;
  alCambiarTitulo?: ((nuevo_titulo: string) => void) | undefined;
  alEliminarIshikawa?: (() => void) | undefined;
  isStepCompleted?: boolean;
  isNa?: boolean;
  onToggleStep?: () => void;
  onToggleNa?: () => void;
  defaultExpanded?: boolean;
  hidePrioritizationTable?: boolean;
  alEnviarA5Porques?: ((causas_priorizadas_texto: string[]) => void) | undefined;
}

/**
 * Coordina la edición de un diagrama de espina de pescado individual, su vista expandida y su tabla de prioridades.
 */
export function IshikawaInteractivo({
  causasRegistradas,
  alCambiarCausas,
  efectoPrincipal,
  alCambiarEfecto,
  causasPriorizadas,
  alCambiarCausasPriorizadas,
  etiquetasPersonalizadas = {},
  alCambiarEtiquetas,
  sufijoTitulo = "",
  tituloPersonalizado,
  alCambiarTitulo,
  alEliminarIshikawa,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
  defaultExpanded = true,
  hidePrioritizationTable,
  alEnviarA5Porques,
}: PropiedadesIshikawaInteractivo) {
  // Normaliza etiquetas legadas que incluían el prefijo "Concepto de:"
  const obtener_etiqueta = (categoria_id: string, por_defecto: string) =>
    (etiquetasPersonalizadas[categoria_id] ?? por_defecto).replace(/^\s*concepto de:\s*/i, "");

  const categorias_config = [
    { id: "machine", label: obtener_etiqueta("machine", "Máquina"), position: "top" as const },
    { id: "method", label: obtener_etiqueta("method", "Método"), position: "top" as const },
    { id: "material", label: obtener_etiqueta("material", "Material"), position: "top" as const },
    {
      id: "manpower",
      label: obtener_etiqueta("manpower", "Mano de Obra"),
      position: "bottom" as const,
    },
    {
      id: "measurement",
      label: obtener_etiqueta("measurement", "Medición"),
      position: "bottom" as const,
    },
    {
      id: "environment",
      label: obtener_etiqueta("environment", "Medio Amb."),
      position: "bottom" as const,
    },
  ];

  const cambiar_etiqueta_categoria = (categoria_id: string, nueva_etiqueta: string) => {
    alCambiarEtiquetas?.((previas) => ({ ...previas, [categoria_id]: nueva_etiqueta }));
  };

  const agregar_causa = (categoria_id: string, texto_causa: string) => {
    if (!texto_causa.trim()) return;
    alCambiarCausas((estado_previo) => ({
      ...estado_previo,
      [categoria_id]: [...(estado_previo[categoria_id] || []), texto_causa.trim()],
    }));
  };

  const editar_causa = (categoria_id: string, indice_objetivo: number, nuevo_valor: string) => {
    alCambiarCausas((estado_previo) => ({
      ...estado_previo,
      [categoria_id]: (estado_previo[categoria_id] || []).map((causa_actual, indice) =>
        indice === indice_objetivo ? nuevo_valor : causa_actual,
      ),
    }));
  };

  const eliminar_causa = (categoria_id: string, indice_objetivo: number) => {
    alCambiarCausas((estado_previo) => ({
      ...estado_previo,
      [categoria_id]: (estado_previo[categoria_id] || []).filter(
        (_causa, indice) => indice !== indice_objetivo,
      ),
    }));
  };

  const titulo_visible = tituloPersonalizado ?? `ISHIKAWA${sufijoTitulo}`;
  const diagrama_nodo = (
    <IshikawaDiagramCanvas
      categorias={categorias_config}
      causas_registradas={causasRegistradas}
      efecto_principal={efectoPrincipal}
      al_cambiar_efecto={alCambiarEfecto}
      al_agregar_causa={agregar_causa}
      al_eliminar_causa={eliminar_causa}
      al_editar_causa={editar_causa}
      al_cambiar_etiqueta={cambiar_etiqueta_categoria}
    />
  );

  return (
    <StepCard
      className="overflow-hidden"
      isStepCompleted={isStepCompleted}
      isNa={isNa}
      onToggleStep={onToggleStep}
      onToggleNa={onToggleNa}
      defaultExpanded={defaultExpanded}
      title={
        <Input
          value={titulo_visible}
          onClick={(evento) => evento.stopPropagation()}
          onChange={(evento) => alCambiarTitulo?.(evento.target.value)}
          placeholder={`ISHIKAWA${sufijoTitulo}`}
          className="text-sm font-bold text-muted-foreground uppercase tracking-wider bg-transparent border-transparent hover:border-border focus-visible:border-border px-2 py-0 h-8 w-64 shadow-none"
        />
      }
      headerRight={
        <IshikawaHeaderActions
          titulo_modal={titulo_visible}
          diagrama_nodo={diagrama_nodo}
          al_eliminar_ishikawa={alEliminarIshikawa}
        />
      }
    >
      <div className="space-y-6">
        {diagrama_nodo}
        {!hidePrioritizationTable && (
          <MatrizPriorizacionIshikawa
            valorMatriz={causasPriorizadas}
            alCambiarValores={alCambiarCausasPriorizadas}
            alEnviarA5Porques={alEnviarA5Porques}
          />
        )}
      </div>
    </StepCard>
  );
}
