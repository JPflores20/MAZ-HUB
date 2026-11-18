/**
 * @fileoverview Tabla de estandarización de acciones exitosas (SOP, OPL, LUP y entrenamientos, Paso 28).
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/shared/ui/button";
import { DatePicker } from "@/shared/ui/date_picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { TablaEstandarizacionItem } from "@/domain/pdca";
import { StepInstructions } from "../../components/step_instructions";

interface PropiedadesTablaEstandarizacion {
  items: TablaEstandarizacionItem[];
  onChange: (nuevos_registros: TablaEstandarizacionItem[]) => void;
}

const COLUMNAS_TEXTO_ESTANDARIZACION: {
  campo: keyof Omit<TablaEstandarizacionItem, "id" | "fechaFinalizacion">;
  clave_titulo: string;
}[] = [
  { campo: "accionesMitigar", clave_titulo: "pdcaAct.accionesMitigar" },
  { campo: "herramientaVpo", clave_titulo: "pdcaAct.herramientaVpo" },
  { campo: "dueno", clave_titulo: "pdcaAct.dueno" },
  { campo: "equipoComunicara", clave_titulo: "pdcaAct.equipoComunicara" },
  { campo: "datosEntrenamiento", clave_titulo: "pdcaAct.datosEntrenamiento" },
  { campo: "gopPresentacion", clave_titulo: "pdcaAct.gopPresentacionMejoresPracticas" },
];

/**
 * Permite documentar herramientas VPO, responsables de comunicación y fechas de estandarización.
 */
export const TablaEstandarizacion: React.FC<PropiedadesTablaEstandarizacion> = ({
  items: registros_estandarizacion,
  onChange: al_cambiar_registros,
}) => {
  const { t: translate } = useTranslation();

  const agregar_fila = () => {
    const nuevo_registro: TablaEstandarizacionItem = {
      id: crypto.randomUUID(),
      accionesMitigar: "",
      herramientaVpo: "",
      dueno: "",
      equipoComunicara: "",
      datosEntrenamiento: "",
      gopPresentacion: "",
      fechaFinalizacion: "",
    };
    al_cambiar_registros([...registros_estandarizacion, nuevo_registro]);
  };

  const actualizar_campo = (
    registro_id: string,
    campo: keyof TablaEstandarizacionItem,
    valor: string,
  ) => {
    al_cambiar_registros(
      registros_estandarizacion.map((registro_actual) =>
        registro_actual.id === registro_id
          ? { ...registro_actual, [campo]: valor }
          : registro_actual,
      ),
    );
  };

  const eliminar_fila = (registro_id: string) => {
    al_cambiar_registros(
      registros_estandarizacion.filter((registro_actual) => registro_actual.id !== registro_id),
    );
  };

  return (
    <div className="space-y-4">
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>{translate("pdcaAct.instruccion1")}</li>
          <li>{translate("pdcaAct.instruccion2")}</li>
          <li>{translate("pdcaAct.instruccion3")}</li>
          <li>{translate("pdcaAct.instruccion4")}</li>
          <li>{translate("pdcaAct.instruccion5")}</li>
        </ol>
      </StepInstructions>

      <div className="flex items-center justify-end">
        <Button onClick={agregar_fila} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> {translate("pdcaAct.agregarFila")}
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[1000px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              {COLUMNAS_TEXTO_ESTANDARIZACION.map((columna) => (
                <TableHead
                  key={columna.campo}
                  className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]"
                >
                  {translate(columna.clave_titulo)}
                </TableHead>
              ))}
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {translate("pdcaAct.fechaFinalizacion")}
              </TableHead>
              <TableHead className="w-12 border-none" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!registros_estandarizacion || registros_estandarizacion.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  {translate("pdcaAct.noRegistrosEstandarizacion")}
                </TableCell>
              </TableRow>
            )}
            {registros_estandarizacion?.map((registro_actual) => (
              <TableRow key={registro_actual.id}>
                {COLUMNAS_TEXTO_ESTANDARIZACION.map(({ campo }) => (
                  <TableCell key={campo} className="p-1.5 border-r border-border">
                    <TextareaAutosize
                      value={registro_actual[campo] || ""}
                      onChange={(evento) =>
                        actualizar_campo(registro_actual.id, campo, evento.target.value)
                      }
                      placeholder="..."
                      minRows={1}
                      className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-none resize-none text-justify overflow-hidden"
                      style={{ overflow: "hidden" }}
                    />
                  </TableCell>
                ))}
                <TableCell className="p-1.5">
                  <DatePicker
                    date={
                      registro_actual.fechaFinalizacion
                        ? new Date(registro_actual.fechaFinalizacion)
                        : undefined
                    }
                    setDate={(fecha) =>
                      actualizar_campo(
                        registro_actual.id,
                        "fechaFinalizacion",
                        fecha ? fecha.toISOString() : "",
                      )
                    }
                    className="w-full h-7 text-xs border-0 bg-transparent px-2 shadow-none"
                    placeholder={translate("pdcaAct.seleccionar")}
                  />
                </TableCell>
                <TableCell className="p-1.5 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:bg-red-900/20"
                    onClick={() => eliminar_fila(registro_actual.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
