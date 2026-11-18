/**
 * @fileoverview Row 3 operational impact (downtime, waste losses, non-conforming product) for Fase 1 Resumen.
 */

import { useTranslation } from "react-i18next";
import type { RdaAnomalyContext } from "@/domain/models/rda";
import { RESUMEN_INPUT_CLASS, RESUMEN_TD_CLASS, RESUMEN_TH_CLASS } from "./rda_resumen_styles";

interface RdaResumenContextImpactRowProps {
  context: RdaAnomalyContext;
  is_editable: boolean;
  on_change_context: (field_name: keyof RdaAnomalyContext, value: string) => void;
}

const IMPACT_CELL_SPECS: {
  field: keyof RdaAnomalyContext;
  title_key: string;
  subtitle: string;
  placeholder: string;
}[] = [
  { field: "tiempoParo", title_key: "rda.downtime", subtitle: "(números)", placeholder: "0" },
  {
    field: "unidadesTiempoParo",
    title_key: "rda.units",
    subtitle: "(Tiempo de paro)",
    placeholder: "min / hrs",
  },
  { field: "perdidas", title_key: "rda.lossesWaste", subtitle: "(números)", placeholder: "0" },
  {
    field: "unidadesPerdidas",
    title_key: "rda.units",
    subtitle: "(pérdidas)",
    placeholder: "hl / botellas",
  },
  {
    field: "productosNoConformes",
    title_key: "rda.nonConformingProducts",
    subtitle: "(números)",
    placeholder: "0",
  },
  {
    field: "unidadesNoConformes",
    title_key: "rda.units",
    subtitle: "(producto no conforme)",
    placeholder: "hl / tarimas",
  },
];

/** Renders Row 3 printable & editable operational impact metrics inside the Resumen context table. */
export function RdaResumenContextImpactRow({
  context,
  is_editable,
  on_change_context,
}: RdaResumenContextImpactRowProps) {
  const { t } = useTranslation();

  return (
    <>
      <tr>
        {IMPACT_CELL_SPECS.map((cell_spec) => (
          <th key={cell_spec.field} className={RESUMEN_TH_CLASS}>
            {t(cell_spec.title_key)}
            <br />
            {cell_spec.subtitle}
          </th>
        ))}
      </tr>
      <tr>
        {IMPACT_CELL_SPECS.map((cell_spec) => (
          <td key={cell_spec.field} className={RESUMEN_TD_CLASS}>
            {is_editable ? (
              <input
                type="text"
                value={context[cell_spec.field] || ""}
                onChange={(change_event) => on_change_context(cell_spec.field, change_event.target.value)}
                placeholder={cell_spec.placeholder}
                className={RESUMEN_INPUT_CLASS}
              />
            ) : (
              context[cell_spec.field] || "-"
            )}
          </td>
        ))}
      </tr>
    </>
  );
}
