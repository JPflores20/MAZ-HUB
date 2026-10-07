import React from "react";
import { FileText, FileSpreadsheet, Presentation } from "lucide-react";
import type { TipoDeArchivo } from "../utils/upload-utils";

interface PropiedadesIconoTipoArchivo {
  tipoArchivo: TipoDeArchivo;
  className?: string;
}

/**
 * Icono con fondo de color según el tipo de archivo (PDF, Excel, PowerPoint, otro).
 */
export const IconoTipoArchivo: React.FC<PropiedadesIconoTipoArchivo> = ({
  tipoArchivo,
  className,
}) => {
  const claseContenedor = `rounded-full flex items-center justify-center ${className ?? ""}`;

  switch (tipoArchivo) {
    case "pdf":
      return (
        <div className={`${claseContenedor} bg-red-100 dark:bg-red-900/40`}>
          <FileText className="size-5 text-red-600 dark:text-red-400" />
        </div>
      );
    case "excel":
      return (
        <div className={`${claseContenedor} bg-green-100 dark:bg-green-900/40`}>
          <FileSpreadsheet className="size-5 text-green-600 dark:text-green-400" />
        </div>
      );
    case "powerpoint":
      return (
        <div className={`${claseContenedor} bg-orange-100 dark:bg-orange-900/40`}>
          <Presentation className="size-5 text-orange-600 dark:text-orange-400" />
        </div>
      );
    default:
      return (
        <div className={`${claseContenedor} bg-gray-100 dark:bg-gray-800`}>
          <FileText className="size-5 text-gray-600 dark:text-gray-400" />
        </div>
      );
  }
};
