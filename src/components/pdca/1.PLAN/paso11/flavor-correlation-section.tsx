import React from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import { Dialog, DialogContent, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { 
  type DatosCorrelacionSabor, 
  type SerieCorrelacion, 
  type PuntoCorrelacion, 
  COLORES_SERIES 
} from "./flavor-correlation-utils";
import { EditorSerieCorrelacion } from "./flavor-correlation-editor";
import { GraficaCorrelacion } from "./flavor-correlation-chart";

// Exportar para que otros archivos puedan usarlo
export type FlavorCorrelationData = DatosCorrelacionSabor;

const DATOS_POR_DEFECTO: DatosCorrelacionSabor = {
  positiveTitle: "SENSORY (GLOBAL PANEL) VS % OF TASTERS WHO IDENTIFY THE POSITIVE ATTRIBUTES",
  negativeTitle: "SENSORY (GLOBAL PANEL) VS % OF TASTERS WHO IDENTIFY THE NEGATIVE ATTRIBUTES",
  seriesList: [
    {
      id: "1",
      name: "Clean-End-Finish",
      type: "positive",
      fill: "#000",
      stroke: "#f1c40f",
      points: [
        { id: 1, x: 30, y: 6.3 },
        { id: 2, x: 8, y: 6.1 },
        { id: 3, x: 10, y: 6.2 },
        { id: 4, x: 70, y: 7.7 },
        { id: 5, x: 85, y: 7.1 },
      ],
    },
    {
      id: "2",
      name: "Esters",
      type: "positive",
      fill: "#f1c40f",
      stroke: "#000",
      points: [
        { id: 6, x: 10, y: 6.2 },
        { id: 7, x: 2, y: 6.1 },
        { id: 8, x: 5, y: 6.1 },
        { id: 9, x: 30, y: 7.2 },
        { id: 10, x: 55, y: 7.7 },
      ],
    },
    { id: "pos3", name: "Positivo 3", type: "positive", fill: "#3498db", stroke: "#2980b9", points: [] },
    { id: "pos4", name: "Positivo 4", type: "positive", fill: "#e74c3c", stroke: "#c0392b", points: [] },
    {
      id: "3",
      name: "Linger-Bitter",
      type: "negative",
      fill: "#4a2e00",
      stroke: "#000",
      points: [
        { id: 11, x: 30, y: 7.8 },
        { id: 12, x: 50, y: 7.1 },
        { id: 13, x: 60, y: 6.4 },
        { id: 14, x: 135, y: 6.1 },
      ],
    },
    {
      id: "4",
      name: "Smokey-Phenolic",
      type: "negative",
      fill: "#f1c40f",
      stroke: "#000",
      points: [
        { id: 15, x: 2, y: 7.7 },
        { id: 16, x: 25, y: 7.2 },
        { id: 17, x: 65, y: 6.2 },
        { id: 18, x: 70, y: 6.2 },
      ],
    },
    {
      id: "5",
      name: "Astringent-Drying",
      type: "negative",
      fill: "#654321",
      stroke: "#f1c40f",
      points: [
        { id: 19, x: 30, y: 6.2 },
        { id: 20, x: 50, y: 6.2 },
        { id: 21, x: 60, y: 6.3 },
        { id: 22, x: 50, y: 7.2 },
      ],
    },
    { id: "neg4", name: "Negativo 4", type: "negative", fill: "#9b59b6", stroke: "#8e44ad", points: [] },
  ]
};

export function FlavorCorrelationSection({
  data, onChange, onForceSave, removeNode, isStepCompleted, isNa, onToggleStep, onToggleNa, title = "Correlación"
}: {
  data?: DatosCorrelacionSabor | null;
  onChange?: (datosNuevos: DatosCorrelacionSabor) => void;
  onForceSave?: () => void;
  removeNode?: React.ReactNode;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
  title?: string;
}) {
  const datosActuales = data || DATOS_POR_DEFECTO;
  const tituloPositivo = datosActuales?.positiveTitle || DATOS_POR_DEFECTO.positiveTitle;
  const tituloNegativo = datosActuales?.negativeTitle || DATOS_POR_DEFECTO.negativeTitle;
  const listaSeriesCruda = datosActuales?.seriesList || DATOS_POR_DEFECTO.seriesList;
  const listaSeries = (Array.isArray(listaSeriesCruda) ? listaSeriesCruda : Object.values(listaSeriesCruda || {})) as SerieCorrelacion[];

  const actualizarDatosCorrelacion = (nuevosCampos: Partial<DatosCorrelacionSabor>) => {
    onChange?.({ ...datosActuales, ...nuevosCampos } as DatosCorrelacionSabor);
  };
  
  const actualizarListaSeries = (actualizador: SerieCorrelacion[] | ((previas: SerieCorrelacion[]) => SerieCorrelacion[])) => {
    actualizarDatosCorrelacion({
      seriesList: typeof actualizador === "function" ? actualizador(listaSeries) : actualizador
    });
  };

  const agregarNuevaSerie = (tipoSerie: "positive" | "negative") => {
    const cantidadActual = (listaSeries || []).filter((serieItem) => serieItem.type === tipoSerie).length;
    if (cantidadActual >= 4) return; // Límite de 4 correlaciones

    const colorConfig = COLORES_SERIES[(listaSeries || []).length % COLORES_SERIES.length] ?? {
      fill: "#000000",
      stroke: "#f1c40f",
    };

    actualizarListaSeries((previas: SerieCorrelacion[]) => [
      ...previas,
      {
        id: Date.now().toString(),
        name: `Nueva Serie ${cantidadActual + 1}`,
        type: tipoSerie,
        fill: colorConfig.fill,
        stroke: colorConfig.stroke,
        points: [],
      },
    ]);
  };

  const eliminarSerie = (idSerie: string) => {
    actualizarListaSeries((previas: SerieCorrelacion[]) => previas.filter((serieItem: SerieCorrelacion) => serieItem.id !== idSerie));
  };

  const renombrarSerie = (idSerie: string, nuevoNombre: string) => {
    actualizarListaSeries((previas: SerieCorrelacion[]) => previas.map((serieItem: SerieCorrelacion) => (serieItem.id === idSerie ? { ...serieItem, name: nuevoNombre } : serieItem)));
  };

  const agregarPuntoASerie = (idSerie: string) => {
    actualizarListaSeries((previas: SerieCorrelacion[]) =>
      previas.map((serieItem: SerieCorrelacion) => {
        if (serieItem.id === idSerie) {
          const arregloPuntos = (Array.isArray(serieItem.points) ? serieItem.points : Object.values(serieItem.points || {})) as PuntoCorrelacion[];
          return { ...serieItem, points: [...arregloPuntos, { id: Date.now() + Math.random(), x: 0, y: 6.0 }] };
        }
        return serieItem;
      }),
    );
  };

  const editarValorDePunto = (idSerie: string, indicePunto: number, ejeModificado: "x" | "y", nuevoValor: number) => {
    actualizarListaSeries((previas: SerieCorrelacion[]) =>
      previas.map((serieItem: SerieCorrelacion) => {
        if (serieItem.id === idSerie) {
          const arregloPuntos = (Array.isArray(serieItem.points) ? serieItem.points : Object.values(serieItem.points || {})) as PuntoCorrelacion[];
          return {
            ...serieItem,
            points: arregloPuntos.map((puntoItem: PuntoCorrelacion, iteradorIndice: number) => (iteradorIndice === indicePunto ? { ...puntoItem, [ejeModificado]: nuevoValor } : puntoItem)),
          };
        }
        return serieItem;
      }),
    );
  };

  const eliminarPuntoDeSerie = (idSerie: string, indicePunto: number) => {
    actualizarListaSeries((previas: SerieCorrelacion[]) =>
      previas.map((serieItem: SerieCorrelacion) => {
        if (serieItem.id === idSerie) {
          const arregloPuntos = (Array.isArray(serieItem.points) ? serieItem.points : Object.values(serieItem.points || {})) as PuntoCorrelacion[];
          return { ...serieItem, points: arregloPuntos.filter((_: any, iteradorIndice: number) => iteradorIndice !== indicePunto) };
        }
        return serieItem;
      }),
    );
  };

  const arregloSeriesPositivas = (listaSeries || []).filter((serieItem: SerieCorrelacion) => serieItem.type === "positive");
  const arregloSeriesNegativas = (listaSeries || []).filter((serieItem: SerieCorrelacion) => serieItem.type === "negative");

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
      headerRight={
        <div className="flex items-center gap-2">
          {removeNode}
          <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="h-8">
              <FileText className="size-4 mr-2" /> Editar Puntos
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
            <h3 className="text-lg font-bold">GESTOR DINÁMICO DE CORRELACIONES</h3>
            <div className="flex-1 overflow-y-auto grid md:grid-cols-2 gap-6 pr-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-green-700 dark:text-green-400">
                    Atributos Positivos ({arregloSeriesPositivas.length}/4)
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => agregarNuevaSerie("positive")}
                    disabled={arregloSeriesPositivas.length >= 4}
                    className="h-7 text-xs"
                  >
                    <Plus className="size-3 mr-1" /> Nueva Correlación
                  </Button>
                </div>
                {arregloSeriesPositivas.map((serieItem: SerieCorrelacion) => (
                  <EditorSerieCorrelacion 
                    key={serieItem.id} 
                    serie={serieItem} 
                    alActualizarNombre={renombrarSerie} 
                    alAgregarPunto={agregarPuntoASerie} 
                    alEliminarSerie={eliminarSerie} 
                    alActualizarPunto={editarValorDePunto} 
                    alEliminarPunto={eliminarPuntoDeSerie} 
                  />
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="font-semibold text-red-700 dark:text-red-400">
                    Atributos Negativos ({arregloSeriesNegativas.length}/4)
                  </h4>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => agregarNuevaSerie("negative")}
                    disabled={arregloSeriesNegativas.length >= 4}
                    className="h-7 text-xs"
                  >
                    <Plus className="size-3 mr-1" /> Nueva Correlación
                  </Button>
                </div>
                {arregloSeriesNegativas.map((serieItem: SerieCorrelacion) => (
                  <EditorSerieCorrelacion 
                    key={serieItem.id} 
                    serie={serieItem} 
                    alActualizarNombre={renombrarSerie} 
                    alAgregarPunto={agregarPuntoASerie} 
                    alEliminarSerie={eliminarSerie} 
                    alActualizarPunto={editarValorDePunto} 
                    alEliminarPunto={eliminarPuntoDeSerie} 
                  />
                ))}
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t mt-4">
              <DialogClose asChild>
                <Button onClick={() => onForceSave?.()} className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Guardar y Cerrar
                </Button>
              </DialogClose>
            </div>
          </DialogContent>
          </Dialog>
        </div>
      }
    >
      <div className="grid xl:grid-cols-2 gap-6">
        <GraficaCorrelacion 
          tituloGrafica={tituloPositivo} 
          alCambiarTitulo={(texto) => actualizarDatosCorrelacion({ positiveTitle: texto })} 
          seriesDeDatos={arregloSeriesPositivas} 
          tipoGrafica="positive" 
        />
        <GraficaCorrelacion 
          tituloGrafica={tituloNegativo} 
          alCambiarTitulo={(texto) => actualizarDatosCorrelacion({ negativeTitle: texto })} 
          seriesDeDatos={arregloSeriesNegativas} 
          tipoGrafica="negative" 
        />
      </div>
    </StepCard>
  );
}
