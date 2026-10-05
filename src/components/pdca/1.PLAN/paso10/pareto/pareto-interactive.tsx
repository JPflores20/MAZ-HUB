import React, { useState } from "react";
import { ArrowRight, Plus, X, FileText, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../../step-instructions";
import type { ParetoItem } from "@/data/pdca";
import { construirDatosPareto } from "./pareto-utils";
import { GraficaPareto } from "./pareto-chart";
import { TablaPareto } from "./pareto-table";
import { DialogoImportarPareto } from "./pareto-import-dialog";

export interface PropiedadesParetoInteractivo {
  title?: string;
  subtitle?: string;
  level?: number;
  data?: ParetoItem[];
  onDataChange?: (nuevosDatos: ParetoItem[]) => void;
  onBarClick?: (categoriaClic: string) => void;
  onClose?: () => void;
  unit?: string;
  onUnitChange?: (nuevaUnidad: string) => void;
  isStepCompleted?: boolean;
  isNa?: boolean;
  onToggleStep?: () => void;
  onToggleNa?: () => void;
  onAddRoot?: () => void;
  chart_title?: string;
  on_chart_title_change?: (nuevoTitulo: string) => void;
}

export function ParetoInteractive({
  title: tituloPrincipal = "Análisis de Pareto (PASO 5)",
  subtitle: subtituloCard = "Desglosa el KPI para encontrar el 80/20.",
  level: nivelAnidacion = 0,
  data: datosActuales = [],
  onDataChange: alCambiarDatos,
  onBarClick: alHacerClicBarra,
  onClose: alCerrarComponente,
  unit: unidadMedida = "",
  onUnitChange: alCambiarUnidad,
  isStepCompleted: pasoCompletado,
  isNa: pasoNoAplica,
  onToggleStep: alAlternarPaso,
  onToggleNa: alAlternarNoAplica,
  onAddRoot: alAgregarParetoRaiz,
  chart_title: tituloGraficaExterno,
  on_chart_title_change: alCambiarTituloExterno,
}: PropiedadesParetoInteractivo) {
  const [dialogoPegarAbierto, asignarDialogoPegarAbierto] = useState(false);
  const [pantallaCompletaAbierta, asignarPantallaCompletaAbierta] = useState(false);
  const [tituloInterno, asignarTituloInterno] = useState("");
  const [minimoEjeY, asignarMinimoEjeY] = useState<number>(0);
  const [maximoEjeYTexto, asignarMaximoEjeYTexto] = useState<string>("");

  const tituloGraficaFinal = tituloGraficaExterno !== undefined ? tituloGraficaExterno : tituloInterno;
  const manejadorCambioTitulo = alCambiarTituloExterno ?? asignarTituloInterno;
  const maximoEjeYCalculado: number | "auto" = maximoEjeYTexto === "" ? "auto" : Number(maximoEjeYTexto);

  const { filasPareto, gapTotal } = construirDatosPareto(datosActuales);

  const agregarFilaNueva = () => {
    alCambiarDatos?.([...datosActuales, { id: Date.now(), area: "", gap: 0 } as ParetoItem]);
  };

  const actualizarFilaExistente = (idFila: number, campoModificado: "area" | "gap", nuevoValor: string | number) => {
    alCambiarDatos?.(datosActuales.map((itemRegistro) => (itemRegistro.id === idFila ? { ...itemRegistro, [campoModificado]: nuevoValor } : itemRegistro)));
  };

  const eliminarFilaEspecifica = (idFila: number) => {
    alCambiarDatos?.(datosActuales.filter((itemRegistro) => itemRegistro.id !== idFila));
  };

  const renderizarGrafica = (tamanoMaximoBarra: number) => (
    <GraficaPareto
      filasPareto={filasPareto}
      alHacerClicEnBarra={alHacerClicBarra}
      unidadMedida={unidadMedida}
      minimoEjeY={minimoEjeY}
      maximoEjeY={maximoEjeYCalculado}
      tituloGrafica={tituloGraficaFinal}
      tamanoMaximoBarra={tamanoMaximoBarra}
    />
  );

  return (
    <StepCard
      className="col-span-full animate-in fade-in zoom-in-95"
      title={
        <div className="flex items-center gap-2">
          {nivelAnidacion > 0 && <ArrowRight className="size-4 text-muted-foreground" />}
          <span>{tituloPrincipal}</span>
          <span className="text-muted-foreground/50 font-normal">-</span>
          <Input
            value={tituloGraficaFinal}
            onChange={(eventoCambioInput) => manejadorCambioTitulo(eventoCambioInput.target.value)}
            placeholder="Nombre del pareto (opcional)"
            className="h-7 text-sm font-medium border-dashed bg-transparent shadow-none placeholder:text-muted-foreground/50 focus-visible:bg-background w-64 px-2"
            onClick={(eventoClicCaja) => eventoClicCaja.stopPropagation()}
          />
        </div>
      }
      {...(nivelAnidacion === 0 && pasoCompletado !== undefined ? { isStepCompleted: pasoCompletado } : {})}
      {...(nivelAnidacion === 0 && alAlternarPaso ? { onToggleStep: alAlternarPaso } : {})}
      {...(nivelAnidacion === 0 && pasoNoAplica !== undefined ? { isNa: pasoNoAplica } : {})}
      {...(nivelAnidacion === 0 && alAlternarNoAplica ? { onToggleNa: alAlternarNoAplica } : {})}
      headerRight={
        <div className="flex gap-2">
          {alCerrarComponente && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                  <X className="size-4 mr-2" /> Cerrar
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Eliminar Pareto</AlertDialogTitle>
                  <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction onClick={alCerrarComponente}>Eliminar</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
          {alAgregarParetoRaiz && (
            <Button variant="secondary" size="sm" onClick={(eventoBotones) => { eventoBotones.stopPropagation(); alAgregarParetoRaiz(); }}>
              <Plus className="size-4 mr-2" /> Nuevo Pareto
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={(eventoBotones) => { eventoBotones.stopPropagation(); asignarDialogoPegarAbierto(true); }}>
            <FileText className="size-4 mr-2" /> Importar Excel
          </Button>
          <Button variant="outline" size="sm" onClick={(eventoBotones) => { eventoBotones.stopPropagation(); agregarFilaNueva(); }}>
            <Plus className="size-4 mr-2" /> Agregar Fila
          </Button>
          <DialogoImportarPareto estadoAbierto={dialogoPegarAbierto} alCambiarEstadoAbierto={asignarDialogoPegarAbierto} datosActuales={datosActuales} alCambiarDatos={alCambiarDatos!} />
        </div>
      }
    >
      <p className="text-sm text-muted-foreground ml-9 mb-4">
        {subtituloCard} {alHacerClicBarra && "Haz clic en una barra para desglosarla."}
      </p>

      {nivelAnidacion === 0 && (
        <StepInstructions>
          <p className="mb-2">1. Identifica las categorías para desglosar el KPI (eje X).</p>
          <p className="mb-2">2. Introduce el valor o gap de cada categoría.</p>
          <p className="mb-2">3. La gráfica de Pareto se genera automáticamente.</p>
          <p>4. Haz clic en una barra para crear un Sub-Pareto de nivel 2.</p>
        </StepInstructions>
      )}

      <div className="flex flex-wrap items-center gap-4 mb-4">
        {nivelAnidacion === 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Unidad de Medida:</span>
            <Input value={unidadMedida} onChange={(eventoCambioInput) => alCambiarUnidad?.(eventoCambioInput.target.value)} placeholder="ej. $, %, HL" className="w-28 h-7 text-xs font-bold" />
          </div>
        )}
        <div className="flex items-center gap-2 border rounded-md px-3 py-1 bg-muted/20">
          <span className="text-xs font-semibold text-muted-foreground uppercase">Eje Y —</span>
          <span className="text-xs text-muted-foreground">Min:</span>
          <Input type="number" value={minimoEjeY} onChange={(eventoCambioInput) => asignarMinimoEjeY(Number(eventoCambioInput.target.value))} className="w-20 h-7 text-xs" />
          <span className="text-xs text-muted-foreground">Max:</span>
          <Input type="number" value={maximoEjeYTexto} onChange={(eventoCambioInput) => asignarMaximoEjeYTexto(eventoCambioInput.target.value)} placeholder="auto" className="w-20 h-7 text-xs" />
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <TablaPareto filasPareto={filasPareto} gapTotal={gapTotal} unidadMedida={unidadMedida} longitudDatosOriginales={datosActuales.length} alActualizarFila={actualizarFilaExistente} alEliminarFila={eliminarFilaEspecifica} />
        {!pantallaCompletaAbierta && (
          <div className="h-[400px] border rounded-md p-3 flex flex-col relative">
            <Button variant="ghost" size="sm" className="absolute top-1 right-1 h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold z-10" onClick={() => asignarPantallaCompletaAbierta(true)}>
              <Maximize2 className="mr-1 size-3" /> Expandir
            </Button>
            {renderizarGrafica(40)}
          </div>
        )}
      </div>

      <Dialog open={pantallaCompletaAbierta} onOpenChange={asignarPantallaCompletaAbierta}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[90vh] p-4 sm:p-6 flex flex-col bg-background">
          <DialogHeader>
            <DialogTitle>{tituloPrincipal} {tituloGraficaFinal ? `- ${tituloGraficaFinal}` : ""}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 w-full min-h-0 pt-4">
            <GraficaPareto filasPareto={filasPareto} alHacerClicEnBarra={(cat) => { alHacerClicBarra?.(cat); asignarPantallaCompletaAbierta(false); }} unidadMedida={unidadMedida} minimoEjeY={minimoEjeY} maximoEjeY={maximoEjeYCalculado} tituloGrafica={""} tamanoMaximoBarra={60} />
          </div>
        </DialogContent>
      </Dialog>
    </StepCard>
  );
}
