import React, { useState } from "react";
import { UploadCloud, RefreshCw, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RendimientoActualPiItem } from "@/data/pdca";
import { subirArchivoFirebase } from "./rendimiento-actual-upload";

interface PropiedadesEvidenciasRendimiento {
  registrosIndicadores: RendimientoActualPiItem[];
  alActualizarRegistro: (idRegistro: string, campoModificado: keyof RendimientoActualPiItem, nuevoValor: string) => void;
}

export const EvidenciasRendimientoActual: React.FC<PropiedadesEvidenciasRendimiento> = ({
  registrosIndicadores,
  alActualizarRegistro,
}) => {
  const [archivosSubiendoActualmente, asignarArchivosSubiendoActualmente] = useState<Set<string>>(new Set());

  const manejarSubidaArchivoLocal = async (eventoInputFile: React.ChangeEvent<HTMLInputElement>, idRegistroAsociado: string) => {
    const archivoSeleccionadoLocal = eventoInputFile.target.files?.[0];
    if (archivoSeleccionadoLocal) {
      try {
        asignarArchivosSubiendoActualmente((previasSet) => new Set(previasSet).add(idRegistroAsociado));
        const urlDescargaFirebase = await subirArchivoFirebase(archivoSeleccionadoLocal);
        alActualizarRegistro(idRegistroAsociado, "evidencia", urlDescargaFirebase);
      } catch (errorSubidaArchivo) {
        console.error("Error subiendo evidencia:", errorSubidaArchivo);
      } finally {
        asignarArchivosSubiendoActualmente((previasSet) => {
          const siguienteSet = new Set(previasSet);
          siguienteSet.delete(idRegistroAsociado);
          return siguienteSet;
        });
      }
    }
  };

  const elementosFiltradosPorNombre = registrosIndicadores?.filter((registroEvaluacion) => registroEvaluacion.nombreIndicador.trim() !== "") || [];

  if (elementosFiltradosPorNombre.length === 0) return null;

  return (
    <div className="mt-8 border-t pt-6">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">EVIDENCIAS POR INDICADOR</h4>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {elementosFiltradosPorNombre.map((registroVisible, indiceCicloLista) => {
          const evidenciaYaCargada = registroVisible.evidencia;
          const estaSubiendoBandera = archivosSubiendoActualmente.has(registroVisible.id);
          const claseContenedorTarjeta = cn("flex flex-col border rounded-xl p-3 bg-white border-border");
          const claseContenedorArrastre = cn(
            "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group bg-slate-50 border-slate-200"
          );

          return (
            <div key={registroVisible.id} className={claseContenedorTarjeta}>
              <p className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2" title={registroVisible.nombreIndicador}>
                {indiceCicloLista + 1}. {registroVisible.nombreIndicador}
              </p>
              <div className={claseContenedorArrastre}>
                {evidenciaYaCargada ? (
                  <>
                    {evidenciaYaCargada.includes("application/pdf") ? (
                      <a href={evidenciaYaCargada} target="_blank" rel="noreferrer" className="flex items-center justify-center w-full h-full text-red-500 font-bold hover:bg-red-50">
                        <FileText className="size-8 mr-2" /> PDF
                      </a>
                    ) : (
                      <img src={evidenciaYaCargada} alt={`Evidencia ${indiceCicloLista + 1}`} className="w-full h-full object-contain" />
                    )}
                    <button
                      onClick={() => alActualizarRegistro(registroVisible.id, "evidencia", "")}
                      className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700 hover:bg-white shadow-sm"
                    >
                      <X className="size-4" />
                    </button>
                  </>
                ) : estaSubiendoBandera ? (
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <RefreshCw className="size-6 mb-1 animate-spin" />
                    <span className="text-[10px] uppercase font-semibold">Subiendo...</span>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                    <UploadCloud className="size-6 mb-1" />
                    <span className="text-[10px] uppercase font-semibold">Subir Foto/PDF</span>
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={(eventoArchivo) => manejarSubidaArchivoLocal(eventoArchivo, registroVisible.id)}
                    />
                  </label>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
