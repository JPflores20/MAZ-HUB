import React from "react";
import { type DefinicionMeta } from "@/data/pdca";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { format, parseISO, isValid } from "date-fns";
import { useTranslation } from "react-i18next";

export const DEFAULT_DEFINICION_META: DefinicionMeta = {
  kpi: "PÉRDIDA DE EXTRACTO",
  pis: "Extracción de levadura en reposo y extracción de levadura en fermentación",
  metodoCalculo: "HANNA",
  desdeValor: "2,58",
  aValor: "2,35",
  hastaFecha: "2026-02-15",
  unidadMedida: "%",
  benchmark: "",
  mejora: "lower",
  responsable: "",
  facilitadorLider: "Jaime Lagunas",
};

interface PropiedadesDefinicionMeta {
  value?: DefinicionMeta;
  onChange: (nuevaMeta: DefinicionMeta) => void;
  readOnly?: boolean;
}

export function PdcaGoalDefinition({ 
  value: metaActual, 
  onChange: alCambiarMeta, 
  readOnly: modoSoloLectura = false 
}: PropiedadesDefinicionMeta) {
    const { t } = useTranslation();
  
  const definicionMetaCombinda: DefinicionMeta = {
    ...DEFAULT_DEFINICION_META,
    ...(metaActual || {}),
  };

  const actualizarCampoMeta = (nombreCampo: keyof DefinicionMeta, nuevoValorCampo: string) => {
    if (modoSoloLectura) return;
    alCambiarMeta({
      ...definicionMetaCombinda,
      [nombreCampo]: nuevoValorCampo,
    });
  };

  return (
    <div className="w-full space-y-3">
      <div className="w-full overflow-x-auto rounded-lg border border-border/80 bg-card shadow-sm">
        <table className="w-full min-w-[700px] border-collapse text-xs">
          {/* Fila del título principal */}
          <thead>
            <tr>
              <th
                colSpan={4}
                className="bg-[#0F2942] py-2.5 px-4 text-center font-display text-sm font-bold uppercase tracking-wider text-white shadow-sm"
              >
                {t('pdcaPlan.dynamic.definiciNDeLaMeta2')}</th>
            </tr>
          </thead>
          <tbody>
            {/* Fila 1: KPI y PI(s) */}
            <tr className="border-b border-border/60">
              <td className="w-[18%] bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.kpi')}</td>
              <td className="w-[32%] p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={definicionMetaCombinda.kpi}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("kpi", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.ejPRdidaDeExtracto')}
                  disabled={modoSoloLectura}
                  className="h-8 font-semibold uppercase text-center text-primary border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="w-[18%] bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.piS')}</td>
              <td className="w-[32%] p-2 bg-background/50">
                <Textarea
                  value={definicionMetaCombinda.pis}
                  onChange={(eventoCambioTextarea) => actualizarCampoMeta("pis", eventoCambioTextarea.target.value)}
                  placeholder={t('pdcaPlan.dynamic.indicadoresDeProcesoPi')}
                  disabled={modoSoloLectura}
                  rows={2}
                  className="min-h-[40px] text-xs text-center resize-none border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary py-1 px-2"
                />
              </td>
            </tr>

            {/* Fila 2: Método de Cálculo */}
            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.mTodoDeCLculo')}</td>
              <td colSpan={3} className="p-2 bg-background/50">
                <Input
                  value={definicionMetaCombinda.metodoCalculo}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("metodoCalculo", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.ejHanna')}
                  disabled={modoSoloLectura}
                  className="h-8 font-semibold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>

            {/* Fila 3: Desde y A */}
            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.desdeValor')}</td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={definicionMetaCombinda.desdeValor}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("desdeValor", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.ej258')}
                  disabled={modoSoloLectura}
                  className="h-8 font-mono font-bold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.aValor')}</td>
              <td className="p-2 bg-background/50">
                <Input
                  value={definicionMetaCombinda.aValor}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("aValor", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.ej235')}
                  disabled={modoSoloLectura}
                  className="h-8 font-mono font-bold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>

            {/* Fila 4: Hasta (Fecha) y Unidad de Medida */}
            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.hastaFecha')}</td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <DatePicker
                  date={
                    definicionMetaCombinda.hastaFecha && isValid(parseISO(definicionMetaCombinda.hastaFecha))
                      ? parseISO(definicionMetaCombinda.hastaFecha)
                      : undefined
                  }
                  setDate={(nuevaFecha) =>
                    actualizarCampoMeta("hastaFecha", nuevaFecha ? format(nuevaFecha, "yyyy-MM-dd") : "")
                  }
                  placeholder={t('pdcaPlan.dynamic.seleccionarFecha')}
                  disabled={modoSoloLectura}
                  className="h-8 text-xs border-none shadow-none font-mono bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-primary w-full justify-center text-center"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.unidadDeMedida')}</td>
              <td className="p-2 bg-background/50">
                <Input
                  value={definicionMetaCombinda.unidadMedida}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("unidadMedida", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.ej')}
                  disabled={modoSoloLectura}
                  className="h-8 font-bold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>

            {/* Fila 5: Benchmark y Mejora */}
            <tr className="border-b border-border/60">
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.benchmark')}</td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={definicionMetaCombinda.benchmark}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("benchmark", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.valorOPlantaBenchmark')}
                  disabled={modoSoloLectura}
                  className="h-8 text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.mejora')}</td>
              <td className="p-2 bg-background/50">
                <Select
                  value={definicionMetaCombinda.mejora}
                  onValueChange={(nuevoValorSelect) => actualizarCampoMeta("mejora", nuevoValorSelect)}
                  disabled={modoSoloLectura}
                >
                  <SelectTrigger className="h-8 border-none shadow-none text-xs font-semibold justify-center text-center">
                    <SelectValue placeholder={t('pdcaPlan.dynamic.seleccionar')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lower">{t('pdcaPlan.dynamic.lowerReducirMenor')}</SelectItem>
                    <SelectItem value="higher">{t('pdcaPlan.dynamic.higherIncrementarMayor')}</SelectItem>
                  </SelectContent>
                </Select>
              </td>
            </tr>

            {/* Fila 6: Responsable y Facilitador/Líder */}
            <tr>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.responsable')}</td>
              <td className="p-2 border-r border-border/60 bg-background/50">
                <Input
                  value={definicionMetaCombinda.responsable}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("responsable", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.nombreDelResponsable')}
                  disabled={modoSoloLectura}
                  className="h-8 font-medium text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
              <td className="bg-[#0F2942] p-2.5 font-bold uppercase text-white border-r border-border/40 text-center">
                {t('pdcaPlan.dynamic.facilitadorLDer')}</td>
              <td className="p-2 bg-background/50">
                <Input
                  value={definicionMetaCombinda.facilitadorLider}
                  onChange={(eventoCambioInput) => actualizarCampoMeta("facilitadorLider", eventoCambioInput.target.value)}
                  placeholder={t('pdcaPlan.dynamic.ejJaimeLagunas')}
                  disabled={modoSoloLectura}
                  className="h-8 font-semibold text-center border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary text-xs"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
