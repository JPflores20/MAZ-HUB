/**
 * @fileoverview Tabla editable de Definición de Meta (KPI, PIs, valores base/objetivo, benchmark y dirección de mejora).
 */
import { useTranslation } from "react-i18next";
import type { DefinicionMeta } from "@/domain/pdca";
import { Input } from "@/shared/ui/input";
import { Textarea } from "@/shared/ui/textarea";
import { DEFAULT_DEFINICION_META } from "./pdca_goal_constants";
import { PdcaGoalExtraRows } from "./pdca_goal_rows";

export { DEFAULT_DEFINICION_META };

interface PropiedadesDefinicionMeta {
  value?: DefinicionMeta;
  onChange: (nueva_meta: DefinicionMeta) => void;
  readOnly?: boolean;
}

const CLASE_ETIQUETA =
  "bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center";
const CLASE_INPUT =
  "h-8 text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs";

/**
 * Renderiza la ficha estructurada de definición de meta con formato estándar de proyecto.
 */
export function PdcaGoalDefinition({
  value: meta_actual,
  onChange: al_cambiar_meta,
  readOnly: solo_lectura = false,
}: PropiedadesDefinicionMeta) {
  const { t: translate } = useTranslation();

  const meta_combinada: DefinicionMeta = {
    ...DEFAULT_DEFINICION_META,
    ...(meta_actual || {}),
  };

  const actualizar_campo = (nombre_campo: keyof DefinicionMeta, nuevo_valor: string) => {
    if (solo_lectura) return;
    al_cambiar_meta({ ...meta_combinada, [nombre_campo]: nuevo_valor });
  };

  return (
    <div className="w-full space-y-3">
      <div className="w-full overflow-x-auto rounded-lg border border-border/80 bg-card shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-xs">
          <thead>
            <tr>
              <th
                colSpan={4}
                className="bg-[#0F2942] py-2.5 px-4 text-center font-display text-sm font-bold uppercase tracking-wider text-white shadow-sm"
              >
                {translate("pdcaPlan.dynamic.definiciNDeLaMeta2")}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-border/60">
              <td className={`w-[18%] ${CLASE_ETIQUETA}`}>
                {translate("pdcaPlan.dynamic.kpi")}
              </td>
              <td className="w-[32%] p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={meta_combinada.kpi}
                  onChange={(evento) => actualizar_campo("kpi", evento.target.value)}
                  placeholder={translate("pdcaPlan.dynamic.ejPRdidaDeExtracto")}
                  disabled={solo_lectura}
                  className={`${CLASE_INPUT} font-semibold uppercase text-primary`}
                />
              </td>
              <td className={`w-[18%] ${CLASE_ETIQUETA}`}>
                {translate("pdcaPlan.dynamic.piS")}
              </td>
              <td className="w-[32%] p-2 bg-background/50">
                <Textarea
                  value={meta_combinada.pis}
                  onChange={(evento) => actualizar_campo("pis", evento.target.value)}
                  placeholder={translate("pdcaPlan.dynamic.indicadoresDeProcesoPi")}
                  disabled={solo_lectura}
                  rows={2}
                  className="min-h-[40px] text-xs text-center resize-none border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary py-1 px-2"
                />
              </td>
            </tr>
            <PdcaGoalExtraRows
              meta_combinada={meta_combinada}
              solo_lectura={solo_lectura}
              clase_etiqueta={CLASE_ETIQUETA}
              clase_input={CLASE_INPUT}
              actualizar_campo={actualizar_campo}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
