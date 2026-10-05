import React from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { type IshikawaItem } from "@/data/pdca";
import { IshikawaInteractivo } from "./ishikawa-interactive";

interface PropiedadesSeccionIshikawa {
  ishikawas: IshikawaItem[];
  onChange: (nuevosRegistrosIshikawa: IshikawaItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export function IshikawaSection({
  ishikawas: listaIshikawas,
  onChange: alCambiarRegistros,
  isStepCompleted: pasoEstaCompletado,
  isNa: pasoEsNoAplica,
  onToggleStep: alAlternarEstadoPaso,
  onToggleNa: alAlternarNoAplica,
}: PropiedadesSeccionIshikawa) {
  const manejarCreacionNuevoIshikawa = () => {
    alCambiarRegistros([
      ...listaIshikawas,
      {
        id: `ishikawa-${Date.now()}`,
        effect: "Efecto / Problema",
        causes: {
          machine: [],
          method: [],
          material: [],
          manpower: [],
          measurement: [],
          environment: [],
        },
        prioritization: [],
      },
    ]);
  };

  const manejarEliminacionIshikawa = (idEliminar: string) => {
    if (listaIshikawas.length > 1) {
      alCambiarRegistros(listaIshikawas.filter((diagramaIshikawa) => diagramaIshikawa.id !== idEliminar));
    }
  };

  const manejarActualizacionAtributoIshikawa = (idActualizar: string, nombreCampo: keyof IshikawaItem, nuevoValorModificado: any) => {
    alCambiarRegistros(listaIshikawas.map((diagramaIshikawa) => (diagramaIshikawa.id === idActualizar ? { ...diagramaIshikawa, [nombreCampo]: nuevoValorModificado } : diagramaIshikawa)));
  };

  return (
    <StepCard
      className="space-y-6"
      title="PASO 16: FISHBONE"
      isStepCompleted={pasoEstaCompletado}
      onToggleStep={alAlternarEstadoPaso}
      isNa={pasoEsNoAplica}
      onToggleNa={alAlternarNoAplica}
    >
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-300 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-700">
          <span className="size-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
          Estamos trabajando en la opción de subir archivos
        </span>
      </div>

      <StepInstructions>
        <p className="mb-2">
          1. Basándote en las conclusiones extraídas de los pasos anteriores para estrechar tu
          enfoque, define el tema que debe ser analizado, y será la "cabeza del pez". Nota: este NO
          debe ser el KPI que estás tratando de mejorar, sino más bien, el PI o aspecto del mismo al
          que has reducido tu enfoque.
        </p>
        <p className="mb-2">
          2. Reunir un equipo y en base a una discusión, rellenar el diagrama con las causas
          levantadas, intentando separar las causas y subcausas según sus categorías.
        </p>
        <p className="mb-2">
          3. Recuerda... ¡esta es una herramienta para la lluvia de ideas! Cualquier cosa que se
          ponga en la Espina de Pescado debe ser validado como un contribuyente al problema o no.
        </p>
        <p className="mb-2">
          4. Para añadir sub-puntos, escribe la causa y presiona Enter dentro de la categoría
          correspondiente.
        </p>
        <p>
          5. Las posibles causas rellenadas en el diagrama deben introducirse en el cuadro de
          prioridades (Filtro) para su posterior validación/confirmación de que efectivamente están
          contribuyendo al problema.
        </p>
      </StepInstructions>

      <div className="space-y-12">
        {listaIshikawas.map((diagramaActualItem, indiceIteracion) => (
          <div key={diagramaActualItem.id} className="relative group/ishikawa pt-4">
            {listaIshikawas.length > 1 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="absolute -right-2 top-0 z-20 h-6 px-2 text-[10px] uppercase font-bold transition-opacity rounded-full shadow-md"
                  >
                    <X className="size-3 mr-1" /> Eliminar Ishikawa
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>¿Eliminar diagrama de Ishikawa?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Esta acción no se puede deshacer. Se eliminarán permanentemente las causas y
                      priorizaciones registradas en este diagrama.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => manejarEliminacionIshikawa(diagramaActualItem.id)}
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                    >
                      Eliminar
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            <IshikawaInteractivo
              causasRegistradas={diagramaActualItem.causes}
              alCambiarCausas={(causasState) => manejarActualizacionAtributoIshikawa(diagramaActualItem.id, "causes", typeof causasState === "function" ? causasState(diagramaActualItem.causes) : causasState)}
              efectoPrincipal={diagramaActualItem.effect}
              alCambiarEfecto={(nuevoEfectoEscribido) => manejarActualizacionAtributoIshikawa(diagramaActualItem.id, "effect", nuevoEfectoEscribido)}
              causasPriorizadas={diagramaActualItem.prioritization}
              alCambiarCausasPriorizadas={(causasPriorizadasModificadas) => manejarActualizacionAtributoIshikawa(diagramaActualItem.id, "prioritization", causasPriorizadasModificadas)}
              etiquetasPersonalizadas={diagramaActualItem.customLabels || {}}
              alCambiarEtiquetas={(etiquetasState) => manejarActualizacionAtributoIshikawa(diagramaActualItem.id, "customLabels", typeof etiquetasState === "function" ? etiquetasState(diagramaActualItem.customLabels || {}) : etiquetasState)}
              sufijoTitulo={listaIshikawas.length > 1 ? ` ${indiceIteracion + 1}` : ""}
              tituloPersonalizado={diagramaActualItem.title}
              alCambiarTitulo={(tituloModificado) => manejarActualizacionAtributoIshikawa(diagramaActualItem.id, "title", tituloModificado)}
            />
          </div>
        ))}
      </div>

      <div className="flex justify-center border-t border-border/60 pt-6">
        <Button onClick={manejarCreacionNuevoIshikawa} variant="outline" className="gap-2 shadow-sm bg-card hover:bg-card/80">
          <Plus className="size-4" /> Agregar otro Ishikawa
        </Button>
      </div>
    </StepCard>
  );
}
