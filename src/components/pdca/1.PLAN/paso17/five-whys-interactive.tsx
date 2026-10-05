import { useState, Fragment } from "react";
import { Plus, MinusCircle, X, Maximize2, UploadCloud, FileText, RefreshCw } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AutoResizeTextarea } from "../../auto-resize-textarea";
import { cn } from "@/lib/utils";
import { subirArchivoAFirebase } from "./five-whys-firebase";

interface PropiedadesFiveWhysInteractivo {
  value?: any[];
  onChange?: (filas: any[]) => void;
  title?: string;
  onTitleChange?: (titulo: string) => void;
  index: number;
  onRemoveTable?: (() => void) | undefined;
}

export function FiveWhysInteractive({
  value,
  onChange,
  title,
  onTitleChange,
  index,
  onRemoveTable,
}: PropiedadesFiveWhysInteractivo) {
  const [esPantallaCompleta, setEsPantallaCompleta] = useState(false);
  const [filasSubiendo, setFilasSubiendo] = useState<Set<number>>(new Set());

  // Firebase a veces guarda arrays como objetos con claves numéricas
  const filasNormalizadas: any[] = Array.isArray(value)
    ? value
    : value && typeof value === "object"
      ? Object.values(value)
      : [];

  const actualizarFila = (id: number, campo: string, valor: string) => {
    if (!onChange) return;
    onChange(filasNormalizadas.map((fila: any) => (fila.id === id ? { ...fila, [campo]: valor } : fila)));
  };

  const agregarFila = () => {
    if (onChange) {
      onChange([
        ...filasNormalizadas,
        { id: Date.now(), q1: "", q2: "", q3: "", q4: "", q5: "", w1: "", w2: "", w3: "", w4: "", w5: "", accion: "" },
      ]);
    }
  };

  const eliminarFila = (id: number) => {
    if (onChange) {
      if (filasNormalizadas.length === 1) return;
      onChange(filasNormalizadas.filter((fila: any) => fila.id !== id));
    }
  };

  const cantidadPorques = Math.max(
    5,
    ...filasNormalizadas.flatMap((fila: any) =>
      Object.keys(fila)
        .filter((k) => k.startsWith("q"))
        .map((k) => parseInt(k.substring(1)))
        .filter((n) => !isNaN(n)),
    ),
  );

  const agregarColumnaPorque = () => {
    if (onChange) {
      const siguientePorque = cantidadPorques + 1;
      onChange(filasNormalizadas.map((fila: any) => ({ ...fila, [`q${siguientePorque}`]: "", [`w${siguientePorque}`]: "" })));
    }
  };

  const quitarColumnaPorque = () => {
    if (onChange && cantidadPorques > 5) {
      onChange(
        filasNormalizadas.map((fila: any) => {
          const nuevaFila = { ...fila };
          delete nuevaFila[`q${cantidadPorques}`];
          delete nuevaFila[`w${cantidadPorques}`];
          return nuevaFila;
        }),
      );
    }
  };

  const contenidoTabla = (
    <div className={cn("overflow-x-auto border border-[#0078D7] rounded-sm bg-white dark:bg-background shadow-sm flex-1", esPantallaCompleta ? "flex flex-col h-full" : "")}>
      <BarraHerramientasTabla
        titulo={title}
        alCambiarTitulo={onTitleChange}
        indice={index}
        esPantallaCompleta={esPantallaCompleta}
        alExpandir={() => setEsPantallaCompleta(true)}
        cantidadPorques={cantidadPorques}
        alAgregarPorque={agregarColumnaPorque}
        alQuitarPorque={quitarColumnaPorque}
        alAgregarCausa={agregarFila}
        alEliminarTabla={onRemoveTable}
      />
      <TablaCuerpo
        filasNormalizadas={filasNormalizadas}
        cantidadPorques={cantidadPorques}
        filasSubiendo={filasSubiendo}
        alActualizarFila={actualizarFila}
        alEliminarFila={eliminarFila}
        alSubirEvidencia={async (idFila, archivo) => {
          try {
            setFilasSubiendo((prev) => new Set(prev).add(idFila));
            const url = await subirArchivoAFirebase(archivo);
            actualizarFila(idFila, "evidencia", url);
          } catch (error) {
            console.error("Error subiendo evidencia:", error);
          } finally {
            setFilasSubiendo((prev) => {
              const siguiente = new Set(prev);
              siguiente.delete(idFila);
              return siguiente;
            });
          }
        }}
      />
    </div>
  );

  return (
    <>
      {!esPantallaCompleta && contenidoTabla}
      <Dialog open={esPantallaCompleta} onOpenChange={setEsPantallaCompleta}>
        <DialogContent className="max-w-[98vw] max-h-[98vh] w-full h-full p-2 sm:p-6 flex flex-col gap-2 overflow-hidden bg-muted/20">
          <DialogHeader className="sr-only">
            <DialogTitle>{title || "5 WHYS"}</DialogTitle>
          </DialogHeader>
          {contenidoTabla}
        </DialogContent>
      </Dialog>
    </>
  );
}

// ─── Barra de herramientas de la tabla ──────────────────────────────────────
interface PropiedadesBarraHerramientas {
  titulo?: string;
  alCambiarTitulo?: (t: string) => void;
  indice: number;
  esPantallaCompleta: boolean;
  alExpandir: () => void;
  cantidadPorques: number;
  alAgregarPorque: () => void;
  alQuitarPorque: () => void;
  alAgregarCausa: () => void;
  alEliminarTabla?: () => void;
}

function BarraHerramientasTabla({ titulo, alCambiarTitulo, indice, esPantallaCompleta, alExpandir, cantidadPorques, alAgregarPorque, alQuitarPorque, alAgregarCausa, alEliminarTabla }: PropiedadesBarraHerramientas) {
  return (
    <div className="flex justify-between items-center px-2 py-1 bg-white dark:bg-background border-b border-[#0078D7]">
      <input type="text" value={titulo || "MÉTODO"} onChange={(e) => alCambiarTitulo?.(e.target.value)}
        className="text-[11px] font-bold text-[#0078D7] uppercase bg-transparent border-none outline-none focus:ring-1 focus:ring-blue-400 p-0.5 w-48"
        placeholder="TÍTULO DE LA TABLA" />
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold" onClick={alAgregarPorque}>
            <Plus className="mr-1 size-3" /> Añadir Por Qué
          </Button>
          {cantidadPorques > 5 && (
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold" onClick={alQuitarPorque}>
              <MinusCircle className="mr-1 size-3" /> Quitar Por Qué
            </Button>
          )}
        </div>
        <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold" onClick={alAgregarCausa}>
          <Plus className="mr-1 size-3" /> Añadir Causa
        </Button>
        {alEliminarTabla && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-destructive hover:bg-destructive/10 font-bold">
                <X className="mr-1 size-3" /> Eliminar Tabla
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Eliminar tabla 5 Whys?</AlertDialogTitle>
                <AlertDialogDescription>Esta acción no se puede deshacer. Se eliminarán permanentemente todas las preguntas y respuestas registradas en esta tabla.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={alEliminarTabla} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
        {!esPantallaCompleta && (
          <Button variant="ghost" size="sm" className="h-6 px-2 text-[10px] text-[#0078D7] hover:bg-blue-50 dark:hover:bg-blue-950 font-bold" onClick={alExpandir}>
            <Maximize2 className="mr-1 size-3" /> Expandir
          </Button>
        )}
        <span className="text-[11px] font-bold text-[#0078D7] uppercase">TEMA {String(indice + 1).padStart(2, "0")}</span>
      </div>
    </div>
  );
}

// ─── Cuerpo de la tabla ──────────────────────────────────────────────────────
interface PropiedadesTablaCuerpo {
  filasNormalizadas: any[];
  cantidadPorques: number;
  filasSubiendo: Set<number>;
  alActualizarFila: (id: number, campo: string, valor: string) => void;
  alEliminarFila: (id: number) => void;
  alSubirEvidencia: (idFila: number, archivo: File) => Promise<void>;
}

function TablaCuerpo({ filasNormalizadas, cantidadPorques, filasSubiendo, alActualizarFila, alEliminarFila, alSubirEvidencia }: PropiedadesTablaCuerpo) {
  return (
    <>
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            {Array.from({ length: cantidadPorques }).map((_, i) => (
              <th key={i} className="font-bold uppercase text-center border-r border-white/20 p-2 text-[10px] min-w-[150px]">{i + 1}º POR QUÉ</th>
            ))}
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[80px] border-r border-white/20">CAUSA RAÍZ</th>
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[150px] border-r border-white/20">ACCION(ES)</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {filasNormalizadas.map((fila: any) => (
            <Fragment key={fila.id}>
              <tr className="border-b border-white group">
                {Array.from({ length: cantidadPorques }).map((_, i) => (
                  <td key={`q-${i}`} className={cn("p-0 border-r border-white align-top", fila.isRootCause === "Sí" ? "bg-red-50 dark:bg-red-950/30" : fila.isRootCause === "No" ? "bg-green-50 dark:bg-green-950/30" : "bg-blue-100/50 dark:bg-blue-900/20")}>
                    <AutoResizeTextarea value={fila[`q${i + 1}`] || ""} onChange={(val) => alActualizarFila(fila.id, `q${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-semibold focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/60 overflow-hidden"
                      placeholder="Pregunta..." />
                  </td>
                ))}
                <td rowSpan={2} className={cn("p-1 border-r border-white align-middle text-center min-w-[80px]", fila.isRootCause === "Sí" ? "bg-red-100 dark:bg-red-900/40" : fila.isRootCause === "No" ? "bg-green-100 dark:bg-green-900/40" : "bg-[#E2E2E2] dark:bg-secondary")}>
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Button variant={fila.isRootCause === "Sí" ? "default" : "outline"} size="sm"
                      onClick={() => alActualizarFila(fila.id, "isRootCause", fila.isRootCause === "Sí" ? "" : "Sí")}
                      className={cn("h-6 w-12 text-[10px] px-0", fila.isRootCause === "Sí" ? "bg-red-600 hover:bg-red-700 text-white border-red-600" : "hover:bg-red-50 hover:text-red-600")}>SÍ</Button>
                    <Button variant={fila.isRootCause === "No" ? "default" : "outline"} size="sm"
                      onClick={() => alActualizarFila(fila.id, "isRootCause", fila.isRootCause === "No" ? "" : "No")}
                      className={cn("h-6 w-12 text-[10px] px-0", fila.isRootCause === "No" ? "bg-green-600 hover:bg-green-700 text-white border-green-600" : "hover:bg-green-50 hover:text-green-600")}>NO</Button>
                  </div>
                </td>
                <td rowSpan={2} className={cn("p-0 border-r border-white align-top", fila.isRootCause === "Sí" ? "bg-red-50 dark:bg-red-950/30" : fila.isRootCause === "No" ? "bg-green-50 dark:bg-green-950/30" : "bg-[#E2E2E2] dark:bg-secondary")}>
                  <AutoResizeTextarea value={fila.accion || ""} onChange={(val) => alActualizarFila(fila.id, "accion", val)}
                    className="w-full min-h-[80px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground overflow-hidden" />
                </td>
                <td rowSpan={2} className="bg-background align-middle">
                  {filasNormalizadas.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive mx-auto block"><X className="size-4" /></Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar fila?</AlertDialogTitle>
                          <AlertDialogDescription>¿Estás seguro que deseas eliminar esta fila? Esta acción no se puede deshacer.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => alEliminarFila(fila.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Eliminar</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </td>
              </tr>
              <tr className="border-b-[3px] border-[#0078D7] group">
                {Array.from({ length: cantidadPorques }).map((_, i) => (
                  <td key={`w-${i}`} className={cn("p-0 border-r border-white align-top", fila.isRootCause === "Sí" ? "bg-red-100 dark:bg-red-900/40" : fila.isRootCause === "No" ? "bg-green-100 dark:bg-green-900/40" : "bg-[#E2E2E2] dark:bg-secondary")}>
                    <AutoResizeTextarea value={fila[`w${i + 1}`] || ""} onChange={(val) => alActualizarFila(fila.id, `w${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/50 overflow-hidden"
                      placeholder="Respuesta..." />
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      <SeccionEvidencias filasNormalizadas={filasNormalizadas} filasSubiendo={filasSubiendo} alActualizarFila={alActualizarFila} alSubirEvidencia={alSubirEvidencia} />
    </>
  );
}

// ─── Sección de evidencias por acción ───────────────────────────────────────
interface PropiedadesSeccionEvidencias {
  filasNormalizadas: any[];
  filasSubiendo: Set<number>;
  alActualizarFila: (id: number, campo: string, valor: string) => void;
  alSubirEvidencia: (idFila: number, archivo: File) => Promise<void>;
}

function SeccionEvidencias({ filasNormalizadas, filasSubiendo, alActualizarFila, alSubirEvidencia }: PropiedadesSeccionEvidencias) {
  const filasConAccion = filasNormalizadas.filter((fila) => fila.accion && fila.accion.trim() !== "");

  return (
    <div className="mt-6 p-4">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">EVIDENCIAS POR ACCIÓN</h4>
      {filasConAccion.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">No hay acciones definidas en esta tabla.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filasConAccion.map((fila, i) => {
            const evidenciaExistente = fila.evidencia;
            const estaSubiendo = filasSubiendo.has(fila.id);
            const esCausaRaiz = fila.isRootCause === "Sí";
            const esNoCausaRaiz = fila.isRootCause === "No";
            const clasesTarjeta = cn("flex flex-col border rounded-xl p-3", esCausaRaiz ? "bg-red-50 border-red-200" : esNoCausaRaiz ? "bg-green-50 border-green-200" : "bg-white border-border");
            const clasesZonaSubida = cn("relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group", esCausaRaiz ? "bg-red-100/50 border-red-300" : esNoCausaRaiz ? "bg-green-100/50 border-green-300" : "bg-slate-50 border-slate-200");

            return (
              <div key={fila.id} className={clasesTarjeta}>
                <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2" title={fila.accion}>{i + 1}. {fila.accion}</p>
                <div className={clasesZonaSubida}>
                  {evidenciaExistente ? (
                    <>
                      {evidenciaExistente.includes("application/pdf") ? (
                        <a href={evidenciaExistente} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-full text-red-500 font-bold hover:bg-red-50">
                          <FileText className="size-8 mr-2" /> PDF
                        </a>
                      ) : (
                        <img src={evidenciaExistente} alt={`Evidencia ${i + 1}`} className="w-full h-full object-contain" />
                      )}
                      <button onClick={() => alActualizarFila(fila.id, "evidencia", "")}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 hover:bg-white shadow-sm">
                        <X className="size-4" />
                      </button>
                    </>
                  ) : estaSubiendo ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <RefreshCw className="size-6 mb-1 animate-spin" />
                      <span className="text-[10px] uppercase font-semibold">Subiendo...</span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                      <UploadCloud className="size-6 mb-1" />
                      <span className="text-[10px] uppercase font-semibold">Subir Foto/PDF</span>
                      <input type="file" accept="image/*,application/pdf" className="hidden"
                        onChange={async (e) => {
                          const archivo = e.target.files?.[0];
                          if (archivo) await alSubirEvidencia(fila.id, archivo);
                        }} />
                    </label>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
