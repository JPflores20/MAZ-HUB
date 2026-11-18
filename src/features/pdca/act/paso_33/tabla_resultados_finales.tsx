/**
 * @fileoverview Tabla de cierre y validación de resultados finales KPI/PI del proyecto PDCA.
 */
import React from "react";
import type { ResultadosFinalesData } from "@/domain/models/pdca";
import { TablaResultadosKpiCard } from "./tabla_resultados_kpi_card";
import { TablaResultadosPiCard } from "./tabla_resultados_pi_card";

interface PropiedadesTablaResultadosFinales {
  data: ResultadosFinalesData;
  onChange: (nuevos_resultados: ResultadosFinalesData) => void;
}

/**
 * Coordina la matriz comparativa final entre el KPI principal y los PIs secundarios.
 */
export const TablaResultadosFinales: React.FC<PropiedadesTablaResultadosFinales> = ({
  data: datos_resultados,
  onChange: al_cambiar_resultados,
}) => {
  const actualizar_datos = (cambios: Partial<ResultadosFinalesData>) => {
    al_cambiar_resultados({ ...datos_resultados, ...cambios });
  };

  const actualizar_kpi = (
    campo: keyof NonNullable<ResultadosFinalesData["kpi"]>,
    valor: string,
  ) => {
    const kpi_actualizado = {
      ...(datos_resultados.kpi || { de: "", a: "", verdeEs: "", mejoraPct: "" }),
      [campo]: valor,
    };
    actualizar_datos({ kpi: kpi_actualizado });
  };

  const agregar_fila_pi = () => {
    const nuevas_filas = [
      ...(datos_resultados.piRows || []),
      { id: crypto.randomUUID(), pi: "", de: "", a: "", verdeEs: "", mejoraPct: "" },
    ];
    actualizar_datos({ piRows: nuevas_filas });
  };

  const actualizar_fila_pi = (
    fila_id: string,
    campo: keyof NonNullable<ResultadosFinalesData["piRows"]>[number],
    valor: string,
  ) => {
    const nuevas_filas = (datos_resultados.piRows || []).map((fila_actual) =>
      fila_actual.id === fila_id ? { ...fila_actual, [campo]: valor } : fila_actual,
    );
    actualizar_datos({ piRows: nuevas_filas });
  };

  const eliminar_fila_pi = (fila_id: string) => {
    actualizar_datos({
      piRows: (datos_resultados.piRows || []).filter((fila_actual) => fila_actual.id !== fila_id),
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
        <TablaResultadosKpiCard
          datos_resultados={datos_resultados}
          al_actualizar_datos={actualizar_datos}
          al_actualizar_kpi={actualizar_kpi}
        />
        <TablaResultadosPiCard
          filas_pi={datos_resultados.piRows || []}
          al_agregar_fila={agregar_fila_pi}
          al_actualizar_fila={actualizar_fila_pi}
          al_eliminar_fila={eliminar_fila_pi}
        />
      </div>
    </div>
  );
};
