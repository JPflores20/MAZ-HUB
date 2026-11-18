/**
 * @fileoverview Fila individual editable de la matriz de alineación con pilares VPO y evidencia multimedia.
 */
import React from "react";
import { Trash2, Upload, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { TableCell, TableRow } from "@/shared/ui/table";
import type { TablaEstandarizacionVpoItem } from "@/domain/models/pdca";
import { sanitize_external_url } from "@/core/security";

interface PropiedadesFilaVpo {
  registro: TablaEstandarizacionVpoItem;
  al_actualizar: (campo: keyof TablaEstandarizacionVpoItem, valor: string) => void;
  al_eliminar_fila: () => void;
  al_subir_archivo: (evento: React.ChangeEvent<HTMLInputElement>) => void;
  al_quitar_evidencia: () => void;
  registrar_input_archivo: (elemento: HTMLInputElement | null) => void;
  abrir_selector_archivo: () => void;
}

const CAMPOS_TEXTO_VPO: (keyof Omit<
  TablaEstandarizacionVpoItem,
  "id" | "fechaFinalizacion" | "status" | "evidencia"
>)[] = [
  "nombreEstandar",
  "herramientaVpo",
  "dueno",
  "equipoComunicara",
  "datosEntrenamiento",
  "gopPresentacion",
];

function obtener_estilo_estado_vpo(estado?: string): string {
  if (estado === "Not Started") return "bg-slate-100 text-slate-700 font-medium";
  if (estado === "In Progress") {
    return "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium border-blue-200 dark:border-blue-800";
  }
  if (estado === "Complete") return "bg-green-100 text-green-700 font-medium border-green-200";
  if (estado === "Retrasado") return "bg-red-100 text-red-700 dark:text-red-300 font-medium border-red-200";
  return "bg-transparent text-slate-700";
}

function resolver_media_vpo(evidencia_cruda?: string): { tipo: "video" | "imagen" | null; url: string } {
  if (!evidencia_cruda) return { tipo: null, url: "" };
  const evidencia_recortada = evidencia_cruda.trim();
  const minusculas = evidencia_recortada.toLowerCase();
  if (
    minusculas.startsWith("data:video/mp4;base64,") ||
    minusculas.startsWith("data:video/webm;base64,")
  ) {
    return { tipo: "video", url: evidencia_recortada };
  }
  const url_segura = sanitize_external_url(evidencia_recortada, { allowDataMedia: true });
  return url_segura ? { tipo: "imagen", url: url_segura } : { tipo: null, url: "" };
}

/**
 * Renderiza una fila completa de la tabla de estandarización VPO con captura multimedia segura.
 */
export const EstandarizacionVpoRow: React.FC<PropiedadesFilaVpo> = ({
  registro,
  al_actualizar,
  al_eliminar_fila,
  al_subir_archivo,
  al_quitar_evidencia,
  registrar_input_archivo,
  abrir_selector_archivo,
}) => {
  const { t: translate } = useTranslation();
  const media_segura = resolver_media_vpo(registro.evidencia);

  return (
    <TableRow>
      {CAMPOS_TEXTO_VPO.map((campo) => (
        <TableCell key={campo} className="p-1.5 align-top">
          <TextareaAutosize
            value={registro[campo]}
            onChange={(evento) => al_actualizar(campo, evento.target.value)}
            minRows={2}
            className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-justify overflow-hidden"
            style={{ overflow: "hidden" }}
            placeholder="..."
          />
        </TableCell>
      ))}
      <TableCell className="p-1.5 align-top">
        <Input
          type="date"
          value={registro.fechaFinalizacion}
          onChange={(evento) => al_actualizar("fechaFinalizacion", evento.target.value)}
          className="h-8 text-xs shadow-none"
        />
      </TableCell>
      <TableCell className="p-1.5 align-top">
        <select
          value={registro.status || ""}
          onChange={(evento) => al_actualizar("status", evento.target.value)}
          className={`w-full h-8 text-xs border rounded-md outline-none cursor-pointer px-2 ${obtener_estilo_estado_vpo(registro.status)}`}
        >
          <option value="" className="bg-white text-slate-900 font-normal">
            {translate("pdcaAct.seleccionar")}
          </option>
          <option value="Not Started" className="bg-white text-slate-900 font-normal">
            Not Started
          </option>
          <option value="In Progress" className="bg-white text-slate-900 font-normal">
            In Progress
          </option>
          <option value="Complete" className="bg-white text-slate-900 font-normal">
            Complete
          </option>
          <option value="Retrasado" className="bg-white text-slate-900 font-normal">
            {translate("pdcaAct.retrasado")}
          </option>
        </select>
      </TableCell>
      <TableCell className="p-1.5 align-top">
        <div className="flex flex-col items-center justify-center min-h-[60px] border rounded-md border-dashed bg-secondary/20 relative">
          {media_segura.tipo ? (
            <div className="relative w-full h-16 group">
              {media_segura.tipo === "video" ? (
                <video src={media_segura.url} className="w-full h-full object-cover rounded-md" />
              ) : (
                <img src={media_segura.url} alt="Evidencia" className="w-full h-full object-cover rounded-md" />
              )}
              <button
                type="button"
                onClick={al_quitar_evidencia}
                className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                title={translate("pdcaAct.eliminarEvidencia")}
              >
                <X className="size-3" />
              </button>
            </div>
          ) : (
            <>
              <input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                ref={registrar_input_archivo}
                onChange={al_subir_archivo}
              />
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={abrir_selector_archivo}
                title={translate("pdcaAct.subirFotoVideo")}
              >
                <Upload className="size-4 text-muted-foreground" />
              </Button>
            </>
          )}
        </div>
      </TableCell>
      <TableCell className="p-1.5 align-middle text-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={al_eliminar_fila}
          className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
          title={translate("pdcaAct.eliminarFila")}
        >
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
};
