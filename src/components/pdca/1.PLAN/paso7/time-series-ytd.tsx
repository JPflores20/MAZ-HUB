import React from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DEFAULT_TARGET_VS_ACTUAL } from "@/data/pdca";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { TablaSeries } from "./time-series-table";
import { GraficaSeries } from "./time-series-chart";
import { useTranslation } from "react-i18next";

interface PropiedadesSeriesTiempo {
  value?: { mes: string; target: number; actual: number | null }[] | undefined;
  onChange?: ((nuevaSerie: { mes: string; target: number; actual: number | null }[]) => void) | undefined;
  unit?: string | undefined;
  onUnitChange?: ((nuevaUnidad: string) => void) | undefined;
  isStepCompleted?: boolean | undefined;
  isNa?: boolean | undefined;
  onToggleStep?: (() => void) | undefined;
  onToggleNa?: (() => void) | undefined;
  title?: string | undefined;
  chartTitle?: string | undefined;
  onTitleChange?: ((nuevoTitulo: string) => void) | undefined;
  customBadge?: React.ReactNode;
  yMin?: number | undefined;
  onYMinChange?: ((nuevoMinimo: number) => void) | undefined;
  yMax?: string | undefined;
  onYMaxChange?: ((nuevoMaximo: string) => void) | undefined;
}

export function TimeSeriesYTD({
  value: serieActual,
  onChange: alCambiarSerie,
  unit: unidadMedida = "$",
  onUnitChange: alCambiarUnidad,
  isStepCompleted: pasoCompletado,
  isNa: pasoNoAplica,
  onToggleStep: alAlternarPaso,
  onToggleNa: alAlternarNoAplica,
  title: tituloPaso = "PASO 3: SITUACIÓN ACTUAL",
  chartTitle: tituloGrafica = "SITUACIÓN ACTUAL",
  onTitleChange: alCambiarTituloGrafica,
  customBadge: medallaPersonalizada,
  yMin: minimoEjeY = 0,
  onYMinChange: alCambiarMinimoY,
  yMax: maximoEjeY = "auto",
  onYMaxChange: alCambiarMaximoY,
}: PropiedadesSeriesTiempo) {
    const { t } = useTranslation();
  
  const datosSeries = serieActual && serieActual.length > 0 ? serieActual : DEFAULT_TARGET_VS_ACTUAL;

  const maximoEjeYCalculado =
    String(maximoEjeY).trim() === "auto" || String(maximoEjeY).trim() === ""
      ? "auto"
      : Number(maximoEjeY);

  const actualizarMes = (indice: number, nuevoValor: string) => {
    const listaActualizada = datosSeries.map((itemSerie, i) => 
      i === indice ? { ...itemSerie, mes: nuevoValor } : itemSerie
    );
    alCambiarSerie?.(listaActualizada);
  };

  const agregarFila = () => {
    const listaActualizada = [...datosSeries, { mes: "Nuevo", target: 0, actual: null }];
    alCambiarSerie?.(listaActualizada);
  };

  const eliminarFila = (indice: number) => {
    if (datosSeries.length <= 1) return;
    const listaActualizada = datosSeries.filter((_, i) => i !== indice);
    alCambiarSerie?.(listaActualizada);
  };

  const actualizarActual = (indice: number, nuevoValor: string) => {
    const listaActualizada = datosSeries.map((itemSerie, i) => 
      i === indice ? { ...itemSerie, actual: nuevoValor === "" ? null : Number(nuevoValor) } : itemSerie
    );
    alCambiarSerie?.(listaActualizada);
  };

  const actualizarMeta = (indice: number, nuevoValor: string) => {
    const listaActualizada = datosSeries.map((itemSerie, i) => 
      i === indice ? { ...itemSerie, target: nuevoValor === "" ? 0 : Number(nuevoValor) } : itemSerie
    );
    alCambiarSerie?.(listaActualizada);
  };

  const metaYtd = datosSeries.length > 0 
    ? datosSeries.reduce((suma, item) => suma + (item.target || 0), 0) / datosSeries.length 
    : 0;
    
  const realesFiltrados = datosSeries.filter((item) => item.actual !== null && item.actual !== undefined);
  const actualYtd = realesFiltrados.length > 0 
    ? realesFiltrados.reduce((suma, item) => suma + (item.actual || 0), 0) / realesFiltrados.length 
    : 0;

  const datosCompletosGrafica = [
    ...datosSeries.map((itemSerie) => ({
      name: itemSerie.mes,
      metaLine: itemSerie.target,
      actualLine: itemSerie.actual,
      ytdTargetBar: null,
      ytdActualBar: null,
    })),
    {
      name: "YTD Target",
      metaLine: null,
      actualLine: null,
      ytdTargetBar: metaYtd,
      ytdActualBar: null,
    },
    {
      name: "YTD Actual",
      metaLine: null,
      actualLine: null,
      ytdTargetBar: null,
      ytdActualBar: actualYtd,
    },
  ];

  const formatearValorVisual = (valorEntrada: any) => {
    if (valorEntrada === null || valorEntrada === undefined || isNaN(valorEntrada)) return "";
    const textoNumerico = Number(valorEntrada).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
    if (unidadMedida === "$") return "$" + textoNumerico;
    return textoNumerico + (unidadMedida ? (unidadMedida === "%" ? "%" : " " + unidadMedida) : "");
  };

  return (
    <StepCard
      className="col-span-full"
      title={tituloPaso}
      isStepCompleted={pasoCompletado}
      onToggleStep={alAlternarPaso}
      headerRight={medallaPersonalizada}
      isNa={pasoNoAplica}
      onToggleNa={alAlternarNoAplica}
    >
      <StepInstructions>
        <p className="mb-1">{t('pdcaPlan.dynamic.1RellenaElCampoGris')}</p>
        <p className="mb-1">
          {t('pdcaPlan.dynamic.2CompletaElPerOdo')}</p>
        <p>{t('pdcaPlan.dynamic.3RellenaLasColumnasObjetivo')}</p>
      </StepInstructions>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('pdcaPlan.dynamic.unidadDeMedida2')}</span>
            <Input
              value={unidadMedida}
              onChange={(eventoCambioInput) => alCambiarUnidad?.(eventoCambioInput.target.value)}
              placeholder={t('pdcaPlan.dynamic.ejHl')}
              className="w-28 h-7 text-xs font-bold"
            />
          </div>
          <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/20 hidden md:flex">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {t('pdcaPlan.dynamic.ejeY')}</span>
            <span className="text-xs text-muted-foreground">{t('pdcaPlan.dynamic.min')}</span>
            <Input
              type="number"
              value={minimoEjeY}
              onChange={(eventoCambioInput) => alCambiarMinimoY?.(Number(eventoCambioInput.target.value))}
              className="w-20 h-7 text-xs"
            />
            <span className="text-xs text-muted-foreground">{t('pdcaPlan.dynamic.max')}</span>
            <Input
              type="text"
              value={maximoEjeY}
              onChange={(eventoCambioInput) => alCambiarMaximoY?.(eventoCambioInput.target.value)}
              placeholder={t('pdcaPlan.dynamic.auto')}
              className="w-20 h-7 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            {t('pdcaPlan.dynamic.plantillaRPida')}</span>
          <Select
            onValueChange={(opcionSeleccionada) => {
              if (window.confirm("Cambiar la plantilla reemplazará los datos actuales en la tabla. ¿Deseas continuar?")) {
                if (opcionSeleccionada === "meses") {
                  alCambiarSerie?.([
                    { mes: "Ene", target: 0, actual: null }, { mes: "Feb", target: 0, actual: null },
                    { mes: "Mar", target: 0, actual: null }, { mes: "Abr", target: 0, actual: null },
                    { mes: "May", target: 0, actual: null }, { mes: "Jun", target: 0, actual: null },
                    { mes: "Jul", target: 0, actual: null }, { mes: "Ago", target: 0, actual: null },
                    { mes: "Sep", target: 0, actual: null }, { mes: "Oct", target: 0, actual: null },
                    { mes: "Nov", target: 0, actual: null }, { mes: "Dic", target: 0, actual: null },
                  ]);
                } else if (opcionSeleccionada.startsWith("sem-")) {
                  const mesExtraido = opcionSeleccionada.split("-")[1];
                  alCambiarSerie?.([
                    { mes: `${mesExtraido} Sem 1`, target: 0, actual: null }, { mes: `${mesExtraido} Sem 2`, target: 0, actual: null },
                    { mes: `${mesExtraido} Sem 3`, target: 0, actual: null }, { mes: `${mesExtraido} Sem 4`, target: 0, actual: null },
                    { mes: `${mesExtraido} Sem 5`, target: 0, actual: null },
                  ]);
                }
              }
            }}
          >
            <SelectTrigger className="h-7 text-xs w-[180px] bg-secondary/30">
              <SelectValue placeholder={t('pdcaPlan.dynamic.elegir')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meses">{t('pdcaPlan.dynamic.12MesesAnual')}</SelectItem>
              <SelectItem value="sem-Ene">{t('pdcaPlan.dynamic.eneroSemanas')}</SelectItem>
              <SelectItem value="sem-Feb">{t('pdcaPlan.dynamic.febreroSemanas')}</SelectItem>
              <SelectItem value="sem-Mar">{t('pdcaPlan.dynamic.marzoSemanas')}</SelectItem>
              <SelectItem value="sem-Abr">{t('pdcaPlan.dynamic.abrilSemanas')}</SelectItem>
              <SelectItem value="sem-May">{t('pdcaPlan.dynamic.mayoSemanas')}</SelectItem>
              <SelectItem value="sem-Jun">{t('pdcaPlan.dynamic.junioSemanas')}</SelectItem>
              <SelectItem value="sem-Jul">{t('pdcaPlan.dynamic.julioSemanas')}</SelectItem>
              <SelectItem value="sem-Ago">{t('pdcaPlan.dynamic.agostoSemanas')}</SelectItem>
              <SelectItem value="sem-Sep">{t('pdcaPlan.dynamic.septiembreSemanas')}</SelectItem>
              <SelectItem value="sem-Oct">{t('pdcaPlan.dynamic.octubreSemanas')}</SelectItem>
              <SelectItem value="sem-Nov">{t('pdcaPlan.dynamic.noviembreSemanas')}</SelectItem>
              <SelectItem value="sem-Dic">{t('pdcaPlan.dynamic.diciembreSemanas')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 mt-4">
        <TablaSeries
          datosSeries={datosSeries}
          metaYtd={metaYtd}
          actualYtd={actualYtd}
          formatearValor={formatearValorVisual}
          alActualizarMes={actualizarMes}
          alActualizarMeta={actualizarMeta}
          alActualizarActual={actualizarActual}
          alAgregarFila={agregarFila}
          alEliminarFila={eliminarFila}
        />
        
        <GraficaSeries
          datosGrafica={datosCompletosGrafica}
          formatearValor={formatearValorVisual}
          tituloGrafica={tituloGrafica}
          alCambiarTituloGrafica={alCambiarTituloGrafica}
          minimoEjeY={minimoEjeY}
          maximoEjeY={maximoEjeYCalculado}
        />
      </div>
    </StepCard>
  );
}
