/**
 * @fileoverview Matriz de alineación de estándares implementados con pilares VPO y carga de evidencias.
 */
import React, { useRef } from "react";
import { Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Button } from "@/shared/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { TablaEstandarizacionVpoItem } from "@/domain/models/pdca";
import { EstandarizacionVpoRow } from "./estandarizacion_vpo_row";

interface PropiedadesTablaEstandarizacionVpo {
  items: TablaEstandarizacionVpoItem[];
  onChange: (nuevos_registros: TablaEstandarizacionVpoItem[]) => void;
}

const COLUMNAS_VPO = [
  { clave_titulo: "pdcaAct.nombreEstandar", clase_extra: "" },
  { clave_titulo: "pdcaAct.herramientaVpo", clase_extra: "" },
  { clave_titulo: "pdcaAct.duenoResponsable", clase_extra: "" },
  { clave_titulo: "pdcaAct.equipoComunicara", clase_extra: "min-w-[150px]" },
  { clave_titulo: "pdcaAct.datosEntrenamiento", clase_extra: "min-w-[150px]" },
  { clave_titulo: "pdcaAct.gopPresentacionMejoresPracticasVpo", clase_extra: "min-w-[150px]" },
  { clave_titulo: "pdcaAct.fechaFinalizacion", clase_extra: "" },
  { clave_titulo: "pdcaAct.status", clase_extra: "" },
  { clave_titulo: "pdcaAct.evidencia", clase_extra: "w-24" },
];

/**
 * Permite documentar estándares VPO, dueños, estatus operativo y evidencia audiovisual asociada.
 */
export const TablaEstandarizacionVpo: React.FC<PropiedadesTablaEstandarizacionVpo> = ({
  items: registros_vpo,
  onChange: al_cambiar_registros,
}) => {
  const { t: translate } = useTranslation();
  const referencias_input_archivo = useRef<Record<string, HTMLInputElement | null>>({});

  const agregar_fila = () => {
    const nuevo_registro: TablaEstandarizacionVpoItem = {
      id: crypto.randomUUID(),
      nombreEstandar: "",
      herramientaVpo: "",
      dueno: "",
      equipoComunicara: "",
      datosEntrenamiento: "",
      gopPresentacion: "",
      fechaFinalizacion: "",
      status: "",
      evidencia: "",
    };
    al_cambiar_registros([...(registros_vpo || []), nuevo_registro]);
  };

  const actualizar_campo = (
    registro_id: string,
    campo: keyof TablaEstandarizacionVpoItem,
    valor: string,
  ) => {
    al_cambiar_registros(
      (registros_vpo || []).map((registro_actual) =>
        registro_actual.id === registro_id
          ? { ...registro_actual, [campo]: valor }
          : registro_actual,
      ),
    );
  };

  const eliminar_fila = (registro_id: string) => {
    al_cambiar_registros(
      (registros_vpo || []).filter((registro_actual) => registro_actual.id !== registro_id),
    );
  };

  const manejar_carga_archivo = (
    registro_id: string,
    evento: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const archivo = evento.target.files?.[0];
    if (!archivo) return;
    const lector = new FileReader();
    lector.onloadend = () => {
      if (typeof lector.result === "string") {
        actualizar_campo(registro_id, "evidencia", lector.result);
      }
    };
    lector.readAsDataURL(archivo);
  };

  const quitar_evidencia = (registro_id: string) => {
    actualizar_campo(registro_id, "evidencia", "");
    const input_actual = referencias_input_archivo.current[registro_id];
    if (input_actual) input_actual.value = "";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">
          {translate("pdcaAct.tablaEstandarizacionVpoTitle")}
        </h3>
        <Button onClick={agregar_fila} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> {translate("pdcaAct.agregarFila")}
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[1200px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              {COLUMNAS_VPO.map((columna) => (
                <TableHead
                  key={columna.clave_titulo}
                  className={`font-bold text-white uppercase text-center border-r border-white/20 text-[10px] ${columna.clase_extra}`}
                >
                  {translate(columna.clave_titulo)}
                </TableHead>
              ))}
              <TableHead className="w-12 border-none" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!registros_vpo || registros_vpo.length === 0) && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  {translate("pdcaAct.noRegistrosEstandarizacion")}
                </TableCell>
              </TableRow>
            )}
            {registros_vpo?.map((registro_actual) => (
              <EstandarizacionVpoRow
                key={registro_actual.id}
                registro={registro_actual}
                al_actualizar={(campo, valor) => actualizar_campo(registro_actual.id, campo, valor)}
                al_eliminar_fila={() => eliminar_fila(registro_actual.id)}
                al_subir_archivo={(evento) => manejar_carga_archivo(registro_actual.id, evento)}
                al_quitar_evidencia={() => quitar_evidencia(registro_actual.id)}
                registrar_input_archivo={(elemento) => {
                  referencias_input_archivo.current[registro_actual.id] = elemento;
                }}
                abrir_selector_archivo={() =>
                  referencias_input_archivo.current[registro_actual.id]?.click()
                }
              />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
