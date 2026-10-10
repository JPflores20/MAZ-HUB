import React, { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AutoResizeTextarea } from "../../../auto-resize-textarea";
import { cn } from "@/lib/utils";
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
import { SeccionEvidencias } from "./five-whys-evidences";

export interface PropiedadesTablaCuerpo {
  filasNormalizadas: any[];
  cantidadPorques: number;
  filasSubiendo: Set<number>;
  alActualizarFila: (id: number, campo: string, valor: string) => void;
  alEliminarFila: (id: number) => void;
  alSubirEvidencia: (idFila: number, archivo: File) => Promise<void>;
}

export function TablaCuerpo({
  filasNormalizadas,
  cantidadPorques,
  filasSubiendo,
  alActualizarFila,
  alEliminarFila,
  alSubirEvidencia,
}: PropiedadesTablaCuerpo) {
  const { t } = useTranslation();

  return (
    <>
      <table className="w-full text-sm border-collapse min-w-[900px]">
        <thead>
          <tr className="bg-[#0078D7] text-white">
            {Array.from({ length: cantidadPorques }).map((_, i) => (
              <th
                key={i}
                className="font-bold uppercase text-center border-r border-white/20 p-2 text-[10px] min-w-[150px]"
              >
                {i + 1}º POR QUÉ
              </th>
            ))}
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[80px] border-r border-white/20">{t("pdcaPlan.paso17_five_whys_root_cause")}</th>
            <th className="font-bold uppercase text-center p-2 text-[10px] min-w-[150px] border-r border-white/20">
              ACCION(ES)
            </th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {filasNormalizadas.map((fila: any) => (
            <Fragment key={fila.id}>
              <tr className="border-b border-white group">
                {Array.from({ length: cantidadPorques }).map((_, i) => (
                  <td
                    key={`q-${i}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      fila.isRootCause === "Sí"
                        ? "bg-red-50 dark:bg-red-950/30"
                        : fila.isRootCause === "No"
                          ? "bg-green-50 dark:bg-green-950/30"
                          : "bg-blue-100 dark:bg-blue-900/40/50 dark:bg-blue-900/20",
                    )}
                  >
                    <AutoResizeTextarea
                      value={fila[`q${i + 1}`] || ""}
                      onChange={(val) => alActualizarFila(fila.id, `q${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-semibold focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/60 overflow-hidden"
                      placeholder="Pregunta..."
                    />
                  </td>
                ))}
                <td
                  rowSpan={2}
                  className={cn(
                    "p-1 border-r border-white align-middle text-center min-w-[80px]",
                    fila.isRootCause === "Sí"
                      ? "bg-red-100 dark:bg-red-900/40"
                      : fila.isRootCause === "No"
                        ? "bg-green-100 dark:bg-green-900/40"
                        : "bg-[#E2E2E2] dark:bg-secondary",
                  )}
                >
                  <div className="flex flex-col items-center justify-center gap-1">
                    <Button
                      variant={fila.isRootCause === "Sí" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        alActualizarFila(
                          fila.id,
                          "isRootCause",
                          fila.isRootCause === "Sí" ? "" : "Sí",
                        )
                      }
                      className={cn(
                        "h-6 w-12 text-[10px] px-0",
                        fila.isRootCause === "Sí"
                          ? "bg-red-600 hover:bg-red-700 text-white border-red-600"
                          : "hover:bg-red-50 dark:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400",
                      )}
                    >{t("pdcaPlan.paso17_five_whys_yes")}</Button>
                    <Button
                      variant={fila.isRootCause === "No" ? "default" : "outline"}
                      size="sm"
                      onClick={() =>
                        alActualizarFila(
                          fila.id,
                          "isRootCause",
                          fila.isRootCause === "No" ? "" : "No",
                        )
                      }
                      className={cn(
                        "h-6 w-12 text-[10px] px-0",
                        fila.isRootCause === "No"
                          ? "bg-green-600 hover:bg-green-700 text-white border-green-600"
                          : "hover:bg-green-50 dark:bg-green-900/20 hover:text-green-600 dark:hover:text-green-400",
                      )}
                    >{t("pdcaPlan.paso17_five_whys_no")}</Button>
                  </div>
                </td>
                <td
                  rowSpan={2}
                  className={cn(
                    "p-0 border-r border-white align-top",
                    fila.isRootCause === "Sí"
                      ? "bg-red-50 dark:bg-red-950/30"
                      : fila.isRootCause === "No"
                        ? "bg-green-50 dark:bg-green-950/30"
                        : "bg-[#E2E2E2] dark:bg-secondary",
                  )}
                >
                  <AutoResizeTextarea
                    value={fila.accion || ""}
                    onChange={(val) => alActualizarFila(fila.id, "accion", val)}
                    className="w-full min-h-[80px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground overflow-hidden"
                  />
                </td>
                <td rowSpan={2} className="bg-background align-middle">
                  {filasNormalizadas.length > 1 && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive mx-auto block"
                        >
                          <X className="size-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar fila?</AlertDialogTitle>
                          <AlertDialogDescription>
                            ¿Estás seguro que deseas eliminar esta fila? Esta acción no se puede
                            deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>{t("pdcaPlan.paso16_ishikawa_cancel")}</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => alEliminarFila(fila.id)}
                            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                          >{t("pdcaPlan.paso17_five_whys_delete")}</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </td>
              </tr>
              <tr className="border-b-[3px] border-[#0078D7] group">
                {Array.from({ length: cantidadPorques }).map((_, i) => (
                  <td
                    key={`w-${i}`}
                    className={cn(
                      "p-0 border-r border-white align-top",
                      fila.isRootCause === "Sí"
                        ? "bg-red-100 dark:bg-red-900/40"
                        : fila.isRootCause === "No"
                          ? "bg-green-100 dark:bg-green-900/40"
                          : "bg-[#E2E2E2] dark:bg-secondary",
                    )}
                  >
                    <AutoResizeTextarea
                      value={fila[`w${i + 1}`] || ""}
                      onChange={(val) => alActualizarFila(fila.id, `w${i + 1}`, val)}
                      className="w-full min-h-[40px] rounded-none border-none shadow-none bg-transparent font-medium focus-visible:ring-1 focus-visible:ring-black/20 text-xs text-center resize-none p-2 dark:text-foreground placeholder:text-muted-foreground/50 overflow-hidden"
                      placeholder="Respuesta..."
                    />
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
      <SeccionEvidencias
        filasNormalizadas={filasNormalizadas}
        filasSubiendo={filasSubiendo}
        alActualizarFila={alActualizarFila}
        alSubirEvidencia={alSubirEvidencia}
      />
    </>
  );
}
