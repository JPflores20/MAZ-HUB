/**
 * @fileoverview Bottom closure sign-off bar (root cause eliminated, zone escalation, CAPEX, GOP, finish date).
 */

import { useTranslation } from "react-i18next";
import type { Rda, RdaClosure } from "@/domain/models/rda";

const CLOSURE_BOOLEAN_FIELDS: {
  key: Exclude<keyof RdaClosure, "fechaFinalizacion">;
  label: string;
}[] = [
  { key: "eliminoCausaRaiz", label: "¿Las acciones correctivas eliminaron la causa raíz?" },
  { key: "requiereEscalar", label: "¿Es requerido escalarlo a nivel de zona?" },
  { key: "necesitaCapex", label: "¿Se necesita CAPEX?" },
  { key: "incluyeComoGop", label: "¿Se incluye como GOP/Buena Práctica/Innovación?" },
];

interface RdaClosureBarProps {
  rda: Rda;
  on_change: (updated_rda: Rda) => void;
}

/** Interactive Phase 3 closing checklist bar synced directly into `rda.closure`. */
export function RdaClosureBar({ rda, on_change }: RdaClosureBarProps) {
  const { t } = useTranslation();

  const update_closure = (patch: Partial<RdaClosure>) => {
    on_change({
      ...rda,
      closure: {
        eliminoCausaRaiz: false,
        requiereEscalar: false,
        necesitaCapex: false,
        incluyeComoGop: false,
        fechaFinalizacion: "",
        ...(rda.closure || {}),
        ...patch,
      },
    });
  };

  return (
    <div className="border border-border rounded-md overflow-hidden bg-card shadow-sm">
      <div className="bg-[#0078D7] px-4 py-2 text-center font-bold text-xs uppercase text-white">
        Reporte de cierre
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-[#0078D7] text-white">
              {CLOSURE_BOOLEAN_FIELDS.map((field_spec) => (
                <th
                  key={field_spec.key}
                  className="border-r border-white/20 p-2 font-bold uppercase text-[10px] text-center"
                >
                  {field_spec.label}
                </th>
              ))}
              <th className="p-2 font-bold uppercase text-[10px] text-center">
                Fecha de finalización
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              {CLOSURE_BOOLEAN_FIELDS.map((field_spec) => {
                const is_active = Boolean(rda.closure?.[field_spec.key]);
                return (
                  <td key={field_spec.key} className="border-r border-border p-2 text-center">
                    <button
                      type="button"
                      onClick={() => update_closure({ [field_spec.key]: !is_active })}
                      className="px-4 py-1.5 rounded-sm font-bold text-xs text-white bg-[#3C7D22] hover:bg-[#2f631b] transition-colors min-w-[70px] cursor-pointer"
                    >
                      {is_active ? t("rdaInternal.yes", "Sí") : t("rdaInternal.no", "No")}
                    </button>
                  </td>
                );
              })}
              <td className="p-2 text-center">
                <input
                  type="date"
                  value={rda.closure?.fechaFinalizacion || ""}
                  onChange={(change_event) =>
                    update_closure({ fechaFinalizacion: change_event.target.value })
                  }
                  className="h-8 rounded border border-input bg-background px-2 text-xs text-center"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
