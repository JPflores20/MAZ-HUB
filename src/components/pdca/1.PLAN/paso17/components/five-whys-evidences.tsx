import React from "react";
import { useTranslation } from "react-i18next";
import { UploadCloud, FileText, X, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PropiedadesSeccionEvidencias {
  filasNormalizadas: any[];
  filasSubiendo: Set<number>;
  alActualizarFila: (id: number, campo: string, valor: string) => void;
  alSubirEvidencia: (idFila: number, archivo: File) => Promise<void>;
}

export function SeccionEvidencias({
  filasNormalizadas,
  filasSubiendo,
  alActualizarFila,
  alSubirEvidencia,
}: PropiedadesSeccionEvidencias) {
  const { t } = useTranslation();

  const filasConAccion = filasNormalizadas.filter(
    (fila) => fila.accion && fila.accion.trim() !== "",
  );

  return (
    <div className="mt-6 p-4">
      <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">{t("pdcaPlan.paso17_five_whys_evidences")}</h4>
      {filasConAccion.length === 0 ? (
        <p className="text-xs text-muted-foreground italic">{t("pdcaPlan.paso17_five_whys_no_actions")}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filasConAccion.map((fila, i) => {
            const evidenciaExistente = fila.evidencia;
            const estaSubiendo = filasSubiendo.has(fila.id);
            const esCausaRaiz = fila.isRootCause === "Sí";
            const esNoCausaRaiz = fila.isRootCause === "No";

            const clasesTarjeta = cn(
              "flex flex-col border rounded-xl p-3",
              esCausaRaiz
                ? "bg-red-50 dark:bg-red-900/20 border-red-200"
                : esNoCausaRaiz
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200"
                  : "bg-white border-border",
            );

            const clasesZonaSubida = cn(
              "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group",
              esCausaRaiz
                ? "bg-red-100/50 border-red-300"
                : esNoCausaRaiz
                  ? "bg-green-100/50 border-green-300"
                  : "bg-slate-50 dark:bg-slate-900 border-slate-200",
            );

            return (
              <div key={fila.id} className={clasesTarjeta}>
                <p
                  className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                  title={fila.accion}
                >
                  {i + 1}. {fila.accion}
                </p>
                <div className={clasesZonaSubida}>
                  {evidenciaExistente ? (
                    <>
                      {evidenciaExistente.includes("application/pdf") ? (
                        <a
                          href={evidenciaExistente}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-center w-full h-full text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:bg-red-900/20"
                        >
                          <FileText className="size-8 mr-2" /> PDF
                        </a>
                      ) : (
                        <img
                          src={evidenciaExistente}
                          alt={`Evidencia ${i + 1}`}
                          className="w-full h-full object-contain"
                        />
                      )}
                      <button
                        onClick={() => alActualizarFila(fila.id, "evidencia", "")}
                        className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm"
                      >
                        <X className="size-4" />
                      </button>
                    </>
                  ) : estaSubiendo ? (
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <RefreshCw className="size-6 mb-1 animate-spin" />
                      <span className="text-[10px] uppercase font-semibold">{t("pdcaPlan.paso14_rendimiento_uploading")}</span>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                      <UploadCloud className="size-6 mb-1" />
                      <span className="text-[10px] uppercase font-semibold">Subir Foto/PDF</span>
                      <input
                        type="file"
                        accept="image/*,application/pdf"
                        className="hidden"
                        onChange={async (e) => {
                          const archivo = e.target.files?.[0];
                          if (archivo) await alSubirEvidencia(fila.id, archivo);
                        }}
                      />
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
