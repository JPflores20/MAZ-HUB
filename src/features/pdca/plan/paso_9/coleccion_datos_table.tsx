/**
 * @fileoverview Paso 9 del PDCA: Tabla de plan de recopilación y estratificación de datos del problema.
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { StepCard } from "@/shared/ui/step_card";
import type { ColeccionDatosItem } from "@/domain/pdca";
import {
  COLUMNAS_COLECCION_DATOS,
  GRUPOS_COLECCION_DATOS,
} from "./coleccion_datos_columns";

interface PropiedadesTablaColeccionDatos {
  items: ColeccionDatosItem[];
  onChange: (nuevos_datos: ColeccionDatosItem[]) => void;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
}

const FONDO_ENCABEZADO = "bg-[#0078D7] text-white font-bold text-center text-xs uppercase";
const FONDO_GRUPO = "bg-[#005A9E] text-white font-bold text-center text-xs uppercase";
const ESTILO_CELDA = "p-1 border border-gray-200";

/**
 * Permite estructurar qué variables medir, método operacional, responsable y frecuencia de muestreo.
 */
export const ColeccionDatosTable: React.FC<PropiedadesTablaColeccionDatos> = ({
  items: registros_coleccion,
  onChange: al_cambiar_registros,
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
}) => {
  const { t: translate } = useTranslation();

  const agregar_registro = () => {
    const nuevo_registro: ColeccionDatosItem = {
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
    al_cambiar_registros([...registros_coleccion, nuevo_registro]);
  };

  const actualizar_campo = (
    registro_id: string,
    campo: keyof ColeccionDatosItem,
    nuevo_valor: string,
  ) => {
    al_cambiar_registros(
      registros_coleccion.map((registro_actual) =>
        registro_actual.id === registro_id
          ? { ...registro_actual, [campo]: nuevo_valor }
          : registro_actual,
      ),
    );
  };

  const eliminar_registro = (registro_id: string) => {
    al_cambiar_registros(
      registros_coleccion.filter((registro_actual) => registro_actual.id !== registro_id),
    );
  };

  return (
    <StepCard
      title={translate("pdcaPlan.dynamic.paso9PlanDeRecopilaci")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-end">
          <Button onClick={agregar_registro} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {translate("pdcaPlan.dynamic.agregarFila")}
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <table className="min-w-[1100px] w-full text-xs border-collapse">
            <thead>
              <tr>
                {GRUPOS_COLECCION_DATOS.map((grupo) => (
                  <th
                    key={grupo.clave_titulo}
                    colSpan={grupo.col_span}
                    className={`${FONDO_GRUPO} border border-white/30 py-2 px-3`}
                  >
                    {translate(grupo.clave_titulo)}
                  </th>
                ))}
                <th className="border border-white/30 bg-[#005A9E] w-10" />
              </tr>
              <tr>
                {COLUMNAS_COLECCION_DATOS.map((columna) => (
                  <th
                    key={String(columna.campo)}
                    className={`${FONDO_ENCABEZADO} border border-white/20 py-1.5 px-2 ${columna.ancho_minimo}`}
                  >
                    {translate(columna.clave_titulo)}
                  </th>
                ))}
                <th className="bg-[#0078D7] border border-white/20 w-10" />
              </tr>
            </thead>
            <tbody>
              {(!registros_coleccion || registros_coleccion.length === 0) && (
                <tr>
                  <td colSpan={12} className="text-center py-6 text-muted-foreground">
                    {translate("pdcaPlan.dynamic.noHayRegistrosEnLa")}
                  </td>
                </tr>
              )}
              {registros_coleccion?.map((registro_item, indice_fila) => (
                <tr
                  key={registro_item.id}
                  className={indice_fila % 2 === 0 ? "bg-white" : "bg-gray-50/60"}
                >
                  {COLUMNAS_COLECCION_DATOS.map(({ campo, ejemplo }) => (
                    <td key={String(campo)} className={ESTILO_CELDA}>
                      <Input
                        value={(registro_item[campo] as string) ?? ""}
                        onChange={(evento) =>
                          actualizar_campo(registro_item.id, campo, evento.target.value)
                        }
                        placeholder={ejemplo}
                        className="h-7 text-xs shadow-none border-0 bg-transparent focus-visible:ring-0 px-1"
                      />
                    </td>
                  ))}
                  <td className={`${ESTILO_CELDA} text-center`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={() => eliminar_registro(registro_item.id)}
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
