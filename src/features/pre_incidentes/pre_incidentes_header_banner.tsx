/**
 * @fileoverview Header banner for the Process Precursors & Incidents Matrix with new-event CTA.
 */

import { Flame, Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";

interface PropiedadesHeaderPreIncidentes {
  on_abrir_modal_nuevo: () => void;
}

/** Displays VPO Severity Matrix banner and button to open the new event creation dialog. */
export function PreIncidentesHeaderBanner({
  on_abrir_modal_nuevo,
}: PropiedadesHeaderPreIncidentes) {
  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-gradient-to-r from-[#0a1428] via-[#1c1638] to-[#2d122b] text-white p-6 rounded-2xl shadow-lg border border-slate-800">
      <div>
        <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
          <Flame className="size-4" />
          Matriz de Severidad VPO · Compañía Cervecera de Zacatecas
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
          Matriz de Precursores e Incidentes de Proceso (5Ws y RDAs)
        </h1>
        <p className="text-sm text-blue-100/80 mt-1">
          Evaluación automática de Potenciales Incidentes de Proceso según la Matriz de Severidad (≥
          100 pts = Incidente, &lt; 100 pts = Precursor).
        </p>
      </div>

      <Button
        onClick={on_abrir_modal_nuevo}
        className="bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-md"
      >
        <Plus className="size-4 mr-2" />
        Registrar Evento / Precursor
      </Button>
    </div>
  );
}
