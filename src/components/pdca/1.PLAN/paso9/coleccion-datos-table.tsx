import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StepCard } from "@/components/ui/step-card";
import type { ColeccionDatosItem } from "@/data/pdca";
import { useTranslation } from "react-i18next";

interface PropiedadesTablaColeccionDatos {
  items: ColeccionDatosItem[];
  onChange: (nuevosDatos: ColeccionDatosItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

const FONDO_ENCABEZADO = "bg-[#0078D7] text-white font-bold text-center text-xs uppercase";
const FONDO_GRUPO = "bg-[#005A9E] text-white font-bold text-center text-xs uppercase";
const ESTILO_CELDA = "p-1 border border-gray-200";

export const ColeccionDatosTable: React.FC<PropiedadesTablaColeccionDatos> = ({
  items: registrosColeccion,
  onChange: alCambiarRegistros,
  isStepCompleted: pasoEstaCompletado,
  onToggleStep: alAlternarEstadoPaso,
  isNa: pasoEsNoAplica,
  onToggleNa: alAlternarNoAplica,
}) => {
    const { t } = useTranslation();
  const manejarAgregarRegistro = () => {
    const nuevoRegistro: ColeccionDatosItem = {
      id: crypto.randomUUID(),
      xs_ys: "",
      variable: "",
      tipo_dato: "",
      definicion_operacional: "",
      metodo_medicion: "",
      estratificacion: "",
      metodo_recoleccion: "",
      quien: "",
      tipo_muestreo: "",
      cuantos: "",
      cada_cuando: "",
    };
    alCambiarRegistros([...registrosColeccion, nuevoRegistro]);
  };

  const manejarActualizacionCampo = (idRegistro: string, campoModificado: keyof ColeccionDatosItem, nuevoValorCampo: string) => {
    alCambiarRegistros(registrosColeccion.map((registroActual) => (registroActual.id === idRegistro ? { ...registroActual, [campoModificado]: nuevoValorCampo } : registroActual)));
  };

  const manejarEliminacionRegistro = (idEliminar: string) => {
    alCambiarRegistros(registrosColeccion.filter((registroActual) => registroActual.id !== idEliminar));
  };

  return (
    <StepCard
      title={t('pdcaPlan.dynamic.paso9PlanDeRecopilaci')}
      isStepCompleted={pasoEstaCompletado}
      onToggleStep={alAlternarEstadoPaso}
      isNa={pasoEsNoAplica}
      onToggleNa={alAlternarNoAplica}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button onClick={manejarAgregarRegistro} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {t('pdcaPlan.dynamic.agregarFila')}</Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <table className="min-w-[1100px] w-full text-xs border-collapse">
            <thead>
              {/* Fila 1: Encabezados de grupo */}
              <tr>
                <th colSpan={4} className={`${FONDO_GRUPO} border border-white/30 py-2 px-3`}>
                  {t('pdcaPlan.dynamic.quMedir')}</th>
                <th colSpan={3} className={`${FONDO_GRUPO} border border-white/30 py-2 px-3`}>
                  {t('pdcaPlan.dynamic.cMoMedirlo')}</th>
                <th colSpan={4} className={`${FONDO_GRUPO} border border-white/30 py-2 px-3`}>
                  {t('pdcaPlan.dynamic.planDeMuestreo')}</th>
                <th className="border border-white/30 bg-[#005A9E] w-10" />
              </tr>
              {/* Fila 2: Encabezados de columnas */}
              <tr>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[70px]`}>{t('pdcaPlan.dynamic.xSOYS')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[100px]`}>{t('pdcaPlan.dynamic.variable')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[90px]`}>{t('pdcaPlan.dynamic.tipoDeDato')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[150px]`}>{t('pdcaPlan.dynamic.definiciNOperacional')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[150px]`}>{t('pdcaPlan.dynamic.mTodoDeMediciN')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[150px]`}>{t('pdcaPlan.dynamic.estratificaciN')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[150px]`}>{t('pdcaPlan.dynamic.mTodoDeRecolecciN')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[90px]`}>{t('pdcaPlan.dynamic.quiN')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[90px]`}>{t('pdcaPlan.dynamic.tipoDeMuestreo')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[70px]`}>{t('pdcaPlan.dynamic.cuNtos')}</th>
                <th className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 min-w-[90px]`}>{t('pdcaPlan.dynamic.cadaCuNdo')}</th>
                <th className="bg-[#0078D7] border border-white/20 w-10" />
              </tr>
            </thead>
            <tbody>
              {(!registrosColeccion || registrosColeccion.length === 0) && (
                <tr>
                  <td colSpan={12} className="text-center py-6 text-muted-foreground">
                    {t('pdcaPlan.dynamic.noHayRegistrosEnLa')}</td>
                </tr>
              )}
              {registrosColeccion?.map((registroIteracion, indiceArray) => (
                <tr key={registroIteracion.id} className={indiceArray % 2 === 0 ? "bg-white" : "bg-gray-50/60"}>
                  {(
                    [
                      { field: "xs_ys", placeholder: "X1, Y1..." },
                      { field: "variable", placeholder: "Ej. Smokey" },
                      { field: "tipo_dato", placeholder: "Ej. Dato continuo" },
                      { field: "definicion_operacional", placeholder: "Ej. Recepción de Arroz" },
                      { field: "metodo_medicion", placeholder: "Ej. Catado Ok-Nook" },
                      { field: "estratificacion", placeholder: "Ej. Medición de cada lote..." },
                      { field: "metodo_recoleccion", placeholder: "Ej. Sensory One" },
                      { field: "quien", placeholder: "Ej. Operador" },
                      { field: "tipo_muestreo", placeholder: "Ej. Proceso" },
                      { field: "cuantos", placeholder: "Ej. 6 Meses" },
                      { field: "cada_cuando", placeholder: "Ej. Diario" },
                    ] as { field: keyof ColeccionDatosItem; placeholder: string }[]
                  ).map(({ field, placeholder }) => (
                    <td key={String(field)} className={ESTILO_CELDA}>
                      <Input
                        value={(registroIteracion[field] as string) ?? ""}
                        onChange={(eventoInputTexto) => manejarActualizacionCampo(registroIteracion.id, field, eventoInputTexto.target.value)}
                        placeholder={placeholder}
                        className="h-7 text-xs shadow-none border-0 bg-transparent focus-visible:ring-0 px-1"
                      />
                    </td>
                  ))}
                  <td className={`${ESTILO_CELDA} text-center`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => manejarEliminacionRegistro(registroIteracion.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </StepCard>
  );
};
