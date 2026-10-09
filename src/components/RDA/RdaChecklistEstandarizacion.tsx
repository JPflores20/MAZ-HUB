import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const ESTANDARES = [
  { id: "mapeo", text: "¿Se requiere actualizar el Mapeo de Procesos? (En caso afirmativo, agregar acción de crear/actualizar mapeo)" },
  { id: "owd", text: "¿Es necesario realizar una OWD para verificar el seguimiento del SOP? (En caso afirmativo, agregar acción de realizar OWD)" },
  { id: "sop", text: "¿Se necesita actualizar el SOP? (En caso afirmativo, agregar acción de crear/actualizar SOP)" },
  { id: "capacitacion", text: "¿Existen cambios o es necesaria capacitación en el SOP? (En caso afirmativo, agregar acción de creación de OPL y entrenamiento)" },
  { id: "monitoreo_ip", text: "¿Es necesario agregar a la rutina el monitoreo del IP? (En caso afirmativo, agregar acción de monitoreo de IP)" }
];

const HERRAMIENTAS_VPO = [
  { id: "chk_checklist", text: "Actualización de Checklist" },
  { id: "chk_pisic", text: "Monitoreo de PI/SIC" },
  { id: "chk_sap", text: "Investigación SAP del equipo" },
  { id: "chk_sla", text: "Creación de SLA" },
  { id: "chk_gops", text: "Revisión de GOPs existentes" }
];

interface Props {
  data: Record<string, boolean>;
  onChange: (data: Record<string, boolean>) => void;
}

export function RdaChecklistEstandarizacion({ data, onChange }: Props) {
  const toggle = (id: string) => {
    onChange({ ...data, [id]: !data[id] });
  };

  const ToggleBtn = ({ id }: { id: string }) => {
    const isYes = data[id] === true;
    return (
      <button
        onClick={() => toggle(id)}
        className={cn(
          "px-4 py-1.5 text-xs font-bold text-white transition-colors min-w-[60px] cursor-pointer",
          isYes ? "bg-[#00B050] hover:bg-[#00B050]/90" : "bg-[#00B050] hover:bg-[#00B050]/90"
        )}
      >
        {isYes ? "Sí" : "No"}
      </button>
    );
  };

  // The original image shows buttons are always green but with text 'No' or 'Sí'
  // I will make them red for No and Green for Si, or just green as requested if we want strictly like the image.
  // Actually, standard UI is usually red for No and Green for Yes. But I will keep it similar to the image (dark green).
  const ToggleBtnStyled = ({ id }: { id: string }) => {
    const isYes = data[id] === true;
    return (
      <button
        onClick={() => toggle(id)}
        className={cn(
          "px-4 py-1 text-xs font-bold text-white transition-colors w-[60px] text-center rounded-sm",
          isYes ? "bg-[#00B050] hover:bg-[#009040]" : "bg-red-500 hover:bg-red-600"
        )}
      >
        {isYes ? "Sí" : "No"}
      </button>
    );
  };

  return (
    <div className="border border-border overflow-hidden rounded-md bg-card text-foreground text-sm">
      <div className="bg-[#0078D7] border-b border-border text-white text-center font-bold p-2 text-base uppercase">
        Checklist de estandarización y gestión del conocimiento - Se incluyó la solución a la rutina
      </div>
      
      <div className="grid grid-cols-2 divide-x divide-border border-b border-border">
        <div className="bg-[#0078D7] text-white p-1.5 text-center font-bold uppercase text-xs">
          Evaluación de estándares
        </div>
        <div className="bg-[#0078D7] text-white p-1.5 text-center font-bold uppercase text-xs">
          Herramientas VPO para considerar en el seguimeinto
        </div>
      </div>

      {ESTANDARES.map((est, i) => (
        <div key={i} className="grid grid-cols-2 divide-x divide-border border-b border-border last:border-b-0">
          <div className="flex items-center p-1.5 gap-3">
            <ToggleBtnStyled id={est.id} />
            <span className="text-xs">{est.text}</span>
          </div>
          <div className="flex items-center p-1.5 gap-3">
            <ToggleBtnStyled id={HERRAMIENTAS_VPO[i].id} />
            <span className="text-xs">{HERRAMIENTAS_VPO[i].text}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
