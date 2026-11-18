/**
 * @fileoverview Subpanel desplegable para pegar pares numéricos (X, Y) desde Excel en una serie de correlación.
 */
import { useState } from "react";
import { Button } from "@/shared/ui/button";

interface PropiedadesPegadoExcelCorrelacion {
  al_procesar_pegado: (texto_crudo: string, reemplazar: boolean) => boolean;
  al_cerrar: () => void;
}

/**
 * Captura columnas tabuladas desde Excel permitiendo anexar o reemplazar puntos de la serie.
 */
export function FlavorCorrelationExcelPaste({
  al_procesar_pegado,
  al_cerrar,
}: PropiedadesPegadoExcelCorrelacion) {
  const [texto_excel, set_texto_excel] = useState("");

  const manejar_accion = (reemplazar: boolean) => {
    if (al_procesar_pegado(texto_excel, reemplazar)) {
      set_texto_excel("");
    }
  };

  return (
    <div className="rounded-md border bg-muted/30 p-2 space-y-2">
      <p className="text-[11px] text-muted-foreground">
        Copia dos columnas <strong>(X, Y)</strong> desde Excel y pégalas aquí (una fila por punto):
      </p>
      <textarea
        value={texto_excel}
        onChange={(evento) => set_texto_excel(evento.target.value)}
        placeholder={"30\t6.3\n45\t7.1\n70\t7.8"}
        rows={3}
        className="w-full rounded border bg-background p-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <div className="flex justify-end gap-1.5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] px-2"
          onClick={al_cerrar}
        >
          Cancelar
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="h-6 text-[11px] px-2"
          onClick={() => manejar_accion(false)}
        >
          Agregar a existentes
        </Button>
        <Button
          type="button"
          size="sm"
          className="h-6 text-[11px] px-2"
          onClick={() => manejar_accion(true)}
        >
          Reemplazar puntos
        </Button>
      </div>
    </div>
  );
}
