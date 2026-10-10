import React from "react";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import { type GopThemeItem } from "@/data/pdca";
import { FilaTemaGop, type TemaGopExtendido } from "./gop-themes-row";

interface PropiedadesSeccionTemasGop {
  data: GopThemeItem[];
  onChange: (nuevosDatosGop: GopThemeItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

const NOMBRES_MESES = [
  "Ene",
  "FEB",
  "MAR",
  "Abr",
  "MAY",
  "Jun",
  "JUL",
  "Ago",
  "SEP",
  "OCT",
  "NOV",
  "Dic",
];

const MAPA_ESTADO_COLORES: Record<string, string> = {
  "Not Started": "bg-gray-300 text-gray-800",
  "In Progress": "bg-amber-400 text-amber-900",
  Complete: "bg-emerald-500 text-white",
  "": "bg-transparent text-transparent",
};

export function GopThemesSection({
  data: registrosTemasGop,
  onChange: alCambiarRegistros,
  isStepCompleted: pasoEstaCompletado,
  isNa: pasoEsNoAplica,
  onToggleStep: alAlternarEstadoPaso,
  onToggleNa: alAlternarNoAplica,
}: PropiedadesSeccionTemasGop) {
  const { t } = useTranslation();

  const manejarAgregarNuevaFila = () => {
    alCambiarRegistros([
      ...registrosTemasGop,
      {
        id: Date.now(),
        tema: "",
        meses: Array(12).fill(false),
        mesesValues: Array(12).fill("100%"), // Almacena los porcentajes
        mesesColors: Array(12).fill("red"), // Almacena el color (rojo o verde)
        focusItems: "",
        status: "",
      } as TemaGopExtendido,
    ]);
  };

  const manejarEliminarFila = (idFilaEliminar: number) => {
    alCambiarRegistros(
      registrosTemasGop.filter((registroFiltro) => registroFiltro.id !== idFilaEliminar),
    );
  };

  const manejarActualizacionCampo = (
    idFilaActualizar: number,
    campoNombre: string,
    nuevoValorCampo: any,
  ) => {
    alCambiarRegistros(
      registrosTemasGop.map((registroMapa) =>
        registroMapa.id === idFilaActualizar
          ? { ...registroMapa, [campoNombre]: nuevoValorCampo }
          : registroMapa,
      ),
    );
  };

  // Ciclo de clics: Transparente (false) -> Rojo (true) -> Verde (true) -> Transparente (false)
  const manejarAlternanciaMes = (idFilaModificar: number, indiceDelMes: number) => {
    alCambiarRegistros(
      registrosTemasGop.map((registroActual) => {
        if (registroActual.id === idFilaModificar) {
          const itemExtendidoLocal = registroActual as TemaGopExtendido;
          const arregloMesesNuevos = [...itemExtendidoLocal.meses];
          const arregloValoresNuevos = itemExtendidoLocal.mesesValues
            ? [...itemExtendidoLocal.mesesValues]
            : Array(12).fill("100%");
          const arregloColoresNuevos = itemExtendidoLocal.mesesColors
            ? [...itemExtendidoLocal.mesesColors]
            : Array(12).fill("red");

          const mesEstaActivo = arregloMesesNuevos[indiceDelMes];
          const colorMesActual = arregloColoresNuevos[indiceDelMes];

          if (!mesEstaActivo) {
            // 1. Estaba apagado, lo encendemos en rojo
            arregloMesesNuevos[indiceDelMes] = true;
            arregloColoresNuevos[indiceDelMes] = "red";
          } else if (colorMesActual === "red") {
            // 2. Estaba en rojo, lo pasamos a verde
            arregloMesesNuevos[indiceDelMes] = true;
            arregloColoresNuevos[indiceDelMes] = "green";
          } else {
            // 3. Estaba en verde, lo apagamos
            arregloMesesNuevos[indiceDelMes] = false;
            arregloColoresNuevos[indiceDelMes] = "red"; // Reseteamos a rojo para la próxima vez
          }

          return {
            ...registroActual,
            meses: arregloMesesNuevos,
            mesesValues: arregloValoresNuevos,
            mesesColors: arregloColoresNuevos,
          } as TemaGopExtendido;
        }
        return registroActual;
      }),
    );
  };

  const manejarActualizacionValorMes = (
    idFilaModificar: number,
    indiceDelMes: number,
    nuevoValorCaja: string,
  ) => {
    alCambiarRegistros(
      registrosTemasGop.map((registroIterado) => {
        if (registroIterado.id === idFilaModificar) {
          const itemExtendidoCopia = registroIterado as TemaGopExtendido;
          const copiaValoresMeses = itemExtendidoCopia.mesesValues
            ? [...itemExtendidoCopia.mesesValues]
            : Array(12).fill("100%");
          copiaValoresMeses[indiceDelMes] = nuevoValorCaja;
          return { ...registroIterado, mesesValues: copiaValoresMeses } as TemaGopExtendido;
        }
        return registroIterado;
      }),
    );
  };

  return (
    <StepCard
      title="PASO 15: GOPS"
      isStepCompleted={pasoEstaCompletado}
      onToggleStep={alAlternarEstadoPaso}
      isNa={pasoEsNoAplica}
      onToggleNa={alAlternarNoAplica}
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-border text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border p-2 w-10 text-center">#</th>
              <th className="border border-border p-2 min-w-[300px]">{t("pdcaPlan.paso15_gop_section_compliance")}</th>
              {NOMBRES_MESES.map((nombreMesLista) => (
                <th
                  key={nombreMesLista}
                  className="border border-border p-2 w-10 text-center text-xs bg-[#0070c0] text-white font-bold"
                >
                  {nombreMesLista}
                </th>
              ))}
              <th className="border border-border p-2 w-28 text-center text-xs">{t("pdcaPlan.paso15_gop_section_commitment_date")}</th>
              <th className="border border-border p-2 w-20 text-center text-xs">% AVANCE</th>
              <th className="border border-border p-2 w-24 text-center text-xs">{t("pdcaPlan.paso15_gop_section_focus_items")}</th>
              <th className="border border-border p-2 w-32 text-center text-xs">{t("pdcaPlan.paso15_gop_section_focus_status")}</th>
              <th className="border border-border p-2 w-10 text-center"></th>
            </tr>
          </thead>
          <tbody>
            {registrosTemasGop.length === 0 && (
              <tr>
                <td colSpan={19} className="p-4 text-center text-muted-foreground">
                  No hay temas registrados. Haz clic en "Agregar Tema" para comenzar.
                </td>
              </tr>
            )}
            {registrosTemasGop.map((registroIteradoMapa, indiceCicloTabla) => (
              <FilaTemaGop
                key={registroIteradoMapa.id}
                registroGop={registroIteradoMapa as TemaGopExtendido}
                indiceFila={indiceCicloTabla}
                alActualizarCampo={manejarActualizacionCampo}
                alAlternarMes={manejarAlternanciaMes}
                alActualizarValorMes={manejarActualizacionValorMes}
                alEliminarFila={manejarEliminarFila}
                listaMeses={NOMBRES_MESES}
                mapaColoresEstado={MAPA_ESTADO_COLORES}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-center mt-4">
        <Button onClick={manejarAgregarNuevaFila} variant="outline" size="sm" className="gap-2">
          <Plus className="size-4" />{t("pdcaPlan.paso15_gop_section_add_theme")}</Button>
      </div>
    </StepCard>
  );
}
