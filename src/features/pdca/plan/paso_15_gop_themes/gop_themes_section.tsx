/**
 * @fileoverview Paso 15 del PDCA: Matriz de seguimiento anual de temas GOP y focos operativos.
 */
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { StepCard } from "@/shared/ui/step_card";
import type { GopThemeItem } from "@/domain/pdca";
import { FilaTemaGop } from "./gop_themes_row";
import {
  alternar_estado_mes_gop,
  MAPA_ESTADO_COLORES_GOP,
  NOMBRES_MESES_GOP,
  type TemaGopExtendido,
} from "./gop_themes_helpers";

interface PropiedadesSeccionTemasGop {
  data: GopThemeItem[];
  onChange: (nuevos_datos_gop: GopThemeItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

/**
 * Permite registrar temas GOP y alternar su estado mensual (sin iniciar, rojo o verde).
 */
export function GopThemesSection({
  data: registros_temas_gop,
  onChange: al_cambiar_registros,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}: PropiedadesSeccionTemasGop) {
  const { t: translate } = useTranslation();

  const agregar_fila = () => {
    al_cambiar_registros([
      ...registros_temas_gop,
      {
        id: Date.now(),
        tema: "",
        meses: Array<boolean>(12).fill(false),
        mesesValues: Array<string>(12).fill("100%"),
        mesesColors: Array<string>(12).fill("red"),
        focusItems: "",
        status: "",
      } as TemaGopExtendido,
    ]);
  };

  const eliminar_fila = (fila_id: number) => {
    al_cambiar_registros(
      registros_temas_gop.filter((registro_actual) => registro_actual.id !== fila_id),
    );
  };

  const actualizar_campo = (fila_id: number, campo: string, valor: unknown) => {
    al_cambiar_registros(
      registros_temas_gop.map((registro_actual) =>
        registro_actual.id === fila_id ? { ...registro_actual, [campo]: valor } : registro_actual,
      ),
    );
  };

  const alternar_mes = (fila_id: number, indice_mes: number) => {
    al_cambiar_registros(
      registros_temas_gop.map((registro_actual) =>
        registro_actual.id === fila_id
          ? alternar_estado_mes_gop(registro_actual as TemaGopExtendido, indice_mes)
          : registro_actual,
      ),
    );
  };

  const actualizar_valor_mes = (
    fila_id: number,
    indice_mes: number,
    nuevo_valor: string,
  ) => {
    al_cambiar_registros(
      registros_temas_gop.map((registro_actual) => {
        if (registro_actual.id !== fila_id) return registro_actual;
        const registro_extendido = registro_actual as TemaGopExtendido;
        const valores_meses = registro_extendido.mesesValues
          ? [...registro_extendido.mesesValues]
          : Array<string>(12).fill("100%");
        valores_meses[indice_mes] = nuevo_valor;
        return { ...registro_actual, mesesValues: valores_meses } as TemaGopExtendido;
      }),
    );
  };

  return (
    <StepCard
      title="PASO 15: GOPS"
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 w-10 text-center">#</th>
              <th className="border border-border p-2 min-w-[300px]">
                {translate("pdcaPlan.paso15_gop_section_compliance")}
              </th>
              {NOMBRES_MESES_GOP.map((nombre_mes) => (
                <th
                  key={nombre_mes}
                  className="border border-border p-2 w-10 text-center text-xs bg-[#0070c0] text-white font-bold"
                >
                  {nombre_mes}
                </th>
              ))}
              <th className="border border-border p-2 w-28 text-center text-xs">
                {translate("pdcaPlan.paso15_gop_section_commitment_date")}
              </th>
              <th className="border border-border p-2 w-20 text-center text-xs">% AVANCE</th>
              <th className="border border-border p-2 w-24 text-center text-xs">
                {translate("pdcaPlan.paso15_gop_section_focus_items")}
              </th>
              <th className="border border-border p-2 w-32 text-center text-xs">
                {translate("pdcaPlan.paso15_gop_section_focus_status")}
              </th>
              <th className="border border-border p-2 w-10 text-center" />
            </tr>
          </thead>
          <tbody>
            {registros_temas_gop.length === 0 && (
              <tr>
                <td colSpan={19} className="p-4 text-center text-muted-foreground">
                  No hay temas registrados. Haz clic en &quot;Agregar Tema&quot; para comenzar.
                </td>
              </tr>
            )}
            {registros_temas_gop.map((registro_actual, indice_fila) => (
              <FilaTemaGop
                key={registro_actual.id}
                registro_gop={registro_actual as TemaGopExtendido}
                indice_fila={indice_fila}
                al_actualizar_campo={actualizar_campo}
                al_alternar_mes={alternar_mes}
                al_actualizar_valor_mes={actualizar_valor_mes}
                al_eliminar_fila={eliminar_fila}
                mapa_colores_estado={MAPA_ESTADO_COLORES_GOP}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <Button onClick={agregar_fila} variant="outline" size="sm" className="gap-2">
          <Plus className="size-4" />
          {translate("pdcaPlan.paso15_gop_section_add_theme")}
        </Button>
      </div>
    </StepCard>
  );
}
