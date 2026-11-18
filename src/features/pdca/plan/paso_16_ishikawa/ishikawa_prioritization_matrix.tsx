/**
 * @fileoverview Matriz tabular de priorización de causas de Ishikawa (Impacto x Autoridad x Dificultad).
 */
import { useTranslation } from "react-i18next";
import { Plus, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/shared/ui/button";
import {
  IshikawaPrioritizationRow,
  type CausaPriorizacionIshikawa,
} from "./ishikawa_prioritization_row";

interface PropiedadesMatrizPriorizacion {
  valorMatriz?: CausaPriorizacionIshikawa[] | Record<string, CausaPriorizacionIshikawa> | undefined;
  alCambiarValores?: ((causas_modificadas: CausaPriorizacionIshikawa[]) => void) | undefined;
  alEnviarA5Porques?: ((causas_priorizadas_texto: string[]) => void) | undefined;
}

const CAUSAS_POR_DEFECTO: CausaPriorizacionIshikawa[] = [1, 2, 3, 4].map((numero_fila) => ({
  id: numero_fila,
  text: "",
  impact: "",
  authority: "",
  difficulty: "",
  criteria: "",
}));

/**
 * Permite calificar causas del diagrama de pescado y enviar las priorizadas al paso de 5 Porqués.
 */
export function MatrizPriorizacionIshikawa({
  valorMatriz = [],
  alCambiarValores,
  alEnviarA5Porques,
}: PropiedadesMatrizPriorizacion) {
  const { t: translate } = useTranslation();

  let lista_causas: CausaPriorizacionIshikawa[] = CAUSAS_POR_DEFECTO;
  if (Array.isArray(valorMatriz) && valorMatriz.length > 0) {
    lista_causas = valorMatriz;
  } else if (valorMatriz && typeof valorMatriz === "object" && !Array.isArray(valorMatriz)) {
    const valores_objeto = Object.values(valorMatriz);
    if (valores_objeto.length > 0) lista_causas = valores_objeto;
  }

  const actualizar_causa = (causa_id: number, campo: string, valor: string) => {
    alCambiarValores?.(
      lista_causas.map((registro_actual) =>
        registro_actual.id === causa_id
          ? { ...registro_actual, [campo]: valor }
          : registro_actual,
      ),
    );
  };

  const agregar_fila = () => {
    alCambiarValores?.([
      ...lista_causas,
      { id: Date.now(), text: "", impact: "", authority: "", difficulty: "", criteria: "" },
    ]);
  };

  const eliminar_fila = (causa_id: number) => {
    if (lista_causas.length <= 1) return;
    alCambiarValores?.(lista_causas.filter((registro_actual) => registro_actual.id !== causa_id));
  };

  const manejar_envio_5_porques = () => {
    if (!alEnviarA5Porques) return;
    const causas_con_puntaje = lista_causas.filter((causa_item) => {
      const texto = String(causa_item.text || "").trim();
      const total =
        (Number(causa_item.impact) || 0) *
        (Number(causa_item.authority) || 0) *
        (Number(causa_item.difficulty) || 0);
      return texto !== "" && total > 0;
    });

    const candidatas =
      causas_con_puntaje.length > 0
        ? causas_con_puntaje
        : lista_causas.filter((causa_item) => String(causa_item.text || "").trim() !== "");

    const textos_causas = candidatas.map((causa_item) => String(causa_item.text).trim());
    if (textos_causas.length === 0) {
      toast.error(
        "Escribe al menos una causa probable en la matriz para enviarla a 5 Porqués.",
      );
      return;
    }
    alEnviarA5Porques(textos_causas);
  };

  return (
    <div className="mt-8 border border-[#0078D7] rounded-sm overflow-hidden bg-white shadow-sm dark:bg-background">
      <div className="bg-white dark:bg-background px-2 py-1 flex flex-wrap items-center justify-between gap-2 border-b border-[#0078D7]">
        <span className="text-[11px] font-bold text-[#0078D7] uppercase tracking-wide">
          {translate("pdcaPlan.paso16_ishikawa_matrix_title")}
        </span>
        <div className="flex items-center gap-1.5">
          {alEnviarA5Porques && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={manejar_envio_5_porques}
              className="h-6 px-2 text-[10px] uppercase font-bold text-emerald-700 border-emerald-300 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800"
              title="Enviar causas priorizadas a la tabla de 5 Porqués (Paso 17)"
            >
              Enviar a 5 Why&apos;s <ArrowRight className="size-3 ml-1" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={agregar_fila}
            className="h-6 px-2 text-[10px] uppercase font-bold text-[#0078D7] hover:bg-[#0078D7]/10"
          >
            <Plus className="size-3 mr-1" />
            {translate("pdcaPlan.paso16_ishikawa_add_cause")}
          </Button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-[#0078D7] text-white">
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[30%]">
                {translate("pdcaPlan.paso16_ishikawa_matrix_probable_causes")}
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                {translate("pdcaPlan.paso16_ishikawa_matrix_impact")}
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                {translate("pdcaPlan.paso16_ishikawa_matrix_authority")}
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                {translate("pdcaPlan.paso16_ishikawa_matrix_difficulty")}
              </th>
              <th className="font-bold uppercase text-center border-r border-white p-2 text-[10px] w-[14%]">
                {translate("pdcaPlan.paso16_ishikawa_matrix_additional")}
              </th>
              <th className="font-bold uppercase text-center p-2 text-[10px] w-[14%]">
                {translate("pdcaPlan.paso16_ishikawa_matrix_total")}
              </th>
            </tr>
          </thead>
          <tbody>
            {lista_causas.map((registro_causa) => (
              <IshikawaPrioritizationRow
                key={registro_causa.id}
                registro_causa={registro_causa}
                puede_eliminar={lista_causas.length > 1}
                al_actualizar_causa={actualizar_causa}
                al_eliminar_causa={eliminar_fila}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
