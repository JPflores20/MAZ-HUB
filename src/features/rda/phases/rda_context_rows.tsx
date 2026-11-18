/**
 * @fileoverview Row 3 operational impact inputs (downtime, losses, non-conforming products) for RdaContextForm.
 */

import { useTranslation } from "react-i18next";
import type { RdaAnomalyContext } from "@/domain/models/rda";
import { Input } from "@/shared/ui/input";
import { TableCell, TableHead, TableRow } from "@/shared/ui/table";

interface RdaContextImpactRowProps {
  context: RdaAnomalyContext;
  head_class: string;
  cell_class: string;
  input_class: string;
  on_change_field: (field_name: keyof RdaAnomalyContext, value: string) => void;
}

const IMPACT_FIELDS: {
  key: keyof RdaAnomalyContext;
  header_key: string;
  placeholder_key: string;
  is_last?: boolean;
}[] = [
  { key: "tiempoParo", header_key: "rdaInternal.thTiempoParoNum", placeholder_key: "rdaInternal.phTiempoParo" },
  {
    key: "unidadesTiempoParo",
    header_key: "rdaInternal.thUnidadesTiempoParo",
    placeholder_key: "rdaInternal.phUnidadesTiempo",
  },
  { key: "perdidas", header_key: "rdaInternal.thPerdidasNum", placeholder_key: "rdaInternal.phUnidadesTiempo" },
  {
    key: "unidadesPerdidas",
    header_key: "rdaInternal.thUnidadesPerdidas",
    placeholder_key: "rdaInternal.phUnidadesPerdidas",
  },
  {
    key: "productosNoConformes",
    header_key: "rdaInternal.thNoConformesNum",
    placeholder_key: "rdaInternal.phNoConformes",
  },
  {
    key: "unidadesNoConformes",
    header_key: "rdaInternal.thUnidadesNoConformes",
    placeholder_key: "rdaInternal.phUnidadesNoConformes",
    is_last: true,
  },
];

/** Renders Row 3 header and inputs capturing downtime, waste losses, and blocked volume metrics. */
export function RdaContextImpactRow({
  context,
  head_class,
  cell_class,
  input_class,
  on_change_field,
}: RdaContextImpactRowProps) {
  const { t } = useTranslation();

  return (
    <>
      <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
        {IMPACT_FIELDS.map((field_spec) => (
          <TableHead
            key={field_spec.key}
            className={`${head_class} ${field_spec.is_last ? "border-r-0" : ""}`}
          >
            {t(field_spec.header_key)}
          </TableHead>
        ))}
      </TableRow>
      <TableRow>
        {IMPACT_FIELDS.map((field_spec) => (
          <TableCell
            key={field_spec.key}
            className={field_spec.is_last ? "p-2 align-top" : cell_class}
          >
            <Input
              className={input_class}
              value={context[field_spec.key] || ""}
              onChange={(change_event) => on_change_field(field_spec.key, change_event.target.value)}
              placeholder={t(field_spec.placeholder_key)}
            />
          </TableCell>
        ))}
      </TableRow>
    </>
  );
}
