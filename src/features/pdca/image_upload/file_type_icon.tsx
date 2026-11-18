/**
 * @fileoverview Ícono visual codificado por color según la extensión del archivo adjunto.
 */
import React from "react";
import { FileText, FileSpreadsheet, Presentation } from "lucide-react";
import type { TipoDeArchivo } from "./upload_utils";

interface PropiedadesIconoTipoArchivo {
  tipo_archivo: TipoDeArchivo;
  className?: string;
}

/**
 * Muestra un ícono circular distintivo para PDF, hojas de cálculo Excel, presentaciones o documentos.
 */
export const IconoTipoArchivo: React.FC<PropiedadesIconoTipoArchivo> = ({
  tipo_archivo,
  className,
}) => {
  const clase_contenedor = `rounded-full flex items-center justify-center ${className ?? ""}`;

  switch (tipo_archivo) {
    case "pdf":
      return (
        <div className={`${clase_contenedor} bg-red-100 dark:bg-red-900/40`}>
          <FileText className="size-5 text-red-600 dark:text-red-400" />
        </div>
      );
    case "excel":
      return (
        <div className={`${clase_contenedor} bg-green-100 dark:bg-green-900/40`}>
          <FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" />
        </div>
      );
    case "powerpoint":
      return (
        <div className={`${clase_contenedor} bg-orange-100 dark:bg-orange-900/40`}>
          <Presentation className="size-5 text-orange-600 dark:text-orange-400" />
        </div>
      );
    default:
      return (
        <div className={`${clase_contenedor} bg-gray-100 dark:bg-gray-800`}>
          <FileText className="size-5 text-gray-600 dark:text-gray-400" />
        </div>
      );
  }
};
