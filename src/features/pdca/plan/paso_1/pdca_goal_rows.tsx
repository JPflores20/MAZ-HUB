/**
 * @fileoverview Filas inferiores de la tabla de Definición de Meta (Método, Valores, Fechas, Benchmark y Líder).
 */
import { format, parseISO, isValid } from "date-fns";
import { useTranslation } from "react-i18next";
import type { DefinicionMeta } from "@/domain/pdca";
import { Input } from "@/shared/ui/input";
import { DatePicker } from "@/shared/ui/date_picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";

interface PropiedadesFilasMeta {
  meta_combinada: DefinicionMeta;
  solo_lectura: boolean;
  clase_etiqueta: string;
  clase_input: string;
  actualizar_campo: (nombre_campo: keyof DefinicionMeta, nuevo_valor: string) => void;
}

/**
 * Renderiza filas 2 a 6 de la matriz de definición de meta PDCA.
 */
export function PdcaGoalExtraRows({
  meta_combinada,
  solo_lectura,
  clase_etiqueta,
  clase_input,
  actualizar_campo,
}: PropiedadesFilasMeta) {
  const { t: translate } = useTranslation();
  const fecha_objetivo =
    meta_combinada.hastaFecha && isValid(parseISO(meta_combinada.hastaFecha))
      ? parseISO(meta_combinada.hastaFecha)
      : undefined;

  return (
    <>
      <tr className="border-b border-border/60">
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.mTodoDeCLculo")}</td>
        <td colSpan={3} className="p-2 bg-background/50">
          <Input
            value={meta_combinada.metodoCalculo}
            onChange={(evento) => actualizar_campo("metodoCalculo", evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.ejHanna")}
            disabled={solo_lectura}
            className={`${clase_input} font-semibold`}
          />
        </td>
      </tr>
      <tr className="border-b border-border/60">
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.desdeValor")}</td>
        <td className="p-2 border-r border-border/60 bg-background/50">
          <Input
            value={meta_combinada.desdeValor}
            onChange={(evento) => actualizar_campo("desdeValor", evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.ej258")}
            disabled={solo_lectura}
            className={`${clase_input} font-mono font-bold`}
          />
        </td>
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.aValor")}</td>
        <td className="p-2 bg-background/50">
          <Input
            value={meta_combinada.aValor}
            onChange={(evento) => actualizar_campo("aValor", evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.ej235")}
            disabled={solo_lectura}
            className={`${clase_input} font-mono font-bold`}
          />
        </td>
      </tr>
      <tr className="border-b border-border/60">
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.hastaFecha")}</td>
        <td className="p-2 border-r border-border/60 bg-background/50">
          <DatePicker
            date={fecha_objetivo}
            setDate={(nueva_fecha) =>
              actualizar_campo(
                "hastaFecha",
                nueva_fecha ? format(nueva_fecha, "yyyy-MM-dd") : "",
              )
            }
            placeholder={translate("pdcaPlan.dynamic.seleccionarFecha")}
            disabled={solo_lectura}
            className="h-8 text-xs border-none shadow-none font-mono bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-primary w-full justify-center text-center"
          />
        </td>
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.unidadDeMedida")}</td>
        <td className="p-2 bg-background/50">
          <Input
            value={meta_combinada.unidadMedida}
            onChange={(evento) => actualizar_campo("unidadMedida", evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.ej")}
            disabled={solo_lectura}
            className={`${clase_input} font-bold`}
          />
        </td>
      </tr>
      <tr className="border-b border-border/60">
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.benchmark")}</td>
        <td className="p-2 border-r border-border/60 bg-background/50">
          <Input
            value={meta_combinada.benchmark}
            onChange={(evento) => actualizar_campo("benchmark", evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.valorOPlantaBenchmark")}
            disabled={solo_lectura}
            className={clase_input}
          />
        </td>
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.mejora")}</td>
        <td className="p-2 bg-background/50">
          <Select
            value={meta_combinada.mejora}
            onValueChange={(opcion) => actualizar_campo("mejora", opcion)}
            disabled={solo_lectura}
          >
            <SelectTrigger className="h-8 border-none shadow-none text-xs font-semibold justify-center text-center">
              <SelectValue placeholder={translate("pdcaPlan.dynamic.seleccionar")} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="lower">
                {translate("pdcaPlan.dynamic.lowerReducirMenor")}
              </SelectItem>
              <SelectItem value="higher">
                {translate("pdcaPlan.dynamic.higherIncrementarMayor")}
              </SelectItem>
            </SelectContent>
          </Select>
        </td>
      </tr>
      <tr>
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.responsable")}</td>
        <td className="p-2 border-r border-border/60 bg-background/50">
          <Input
            value={meta_combinada.responsable}
            onChange={(evento) => actualizar_campo("responsable", evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.nombreDelResponsable")}
            disabled={solo_lectura}
            className={`${clase_input} font-medium`}
          />
        </td>
        <td className={clase_etiqueta}>{translate("pdcaPlan.dynamic.facilitadorLDer")}</td>
        <td className="p-2 bg-background/50">
          <Input
            value={meta_combinada.facilitadorLider}
            onChange={(evento) => actualizar_campo("facilitadorLider", evento.target.value)}
            placeholder={translate("pdcaPlan.dynamic.ejJaimeLagunas")}
            disabled={solo_lectura}
            className={`${clase_input} font-semibold`}
          />
        </td>
      </tr>
    </>
  );
}
