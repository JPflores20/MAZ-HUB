/**
 * @fileoverview Fila individual de evaluación para cada punto de verificación del SDCA Checklist (Paso 2).
 */
import { Check, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { TableCell, TableRow } from "@/shared/ui/table";
import { Input } from "@/shared/ui/input";
import { cn } from "@/shared/utils/class_names";
import type { VpoCheckpointItem } from "@/domain/pdca";

const MAPA_ESTILOS_PILAR: Record<string, { bg: string; text: string; border: string }> = {
  Seguridad: {
    bg: "bg-red-100 dark:bg-red-950/40",
    text: "text-red-800 dark:text-red-300",
    border: "border-red-200 dark:border-red-900/60",
  },
  Calidad: {
    bg: "bg-blue-100 dark:bg-blue-950/40",
    text: "text-blue-800 dark:text-blue-300",
    border: "border-blue-200 dark:border-blue-900/60",
  },
  "Medio Ambiente": {
    bg: "bg-emerald-100 dark:bg-emerald-950/40",
    text: "text-emerald-800 dark:text-emerald-300",
    border: "border-emerald-200 dark:border-emerald-900/60",
  },
};

interface PropiedadesFilaVpo {
  item_checkpoint: VpoCheckpointItem;
  al_actualizar_evidencia: (checkpoint_id: string, texto_evidencia: string) => void;
  al_actualizar_estatus: (
    checkpoint_id: string,
    nuevo_estatus: "YES" | "NO" | "N/A" | "",
  ) => void;
}

/**
 * Renderiza el bloque/pilar, criterio de verificación, campo de evidencia y selector YES/NO/N-A.
 */
export function FilaCheckpointVpo({
  item_checkpoint,
  al_actualizar_evidencia,
  al_actualizar_estatus,
}: PropiedadesFilaVpo) {
  const { t: translate } = useTranslation();
  const estilo_pilar = MAPA_ESTILOS_PILAR[item_checkpoint.pilar] || {
    bg: "bg-secondary",
    text: "text-secondary-foreground",
    border: "border-border",
  };

  return (
    <TableRow className="hover:bg-secondary/30 transition-colors border-b border-border/60">
      <TableCell className="py-3 px-4 border-r border-border/60 align-top">
        <span
          className={cn(
            "inline-block rounded-md px-2.5 py-1 text-[11px] font-bold border leading-snug",
            estilo_pilar.bg,
            estilo_pilar.text,
            estilo_pilar.border,
          )}
        >
          {item_checkpoint.pilar}
        </span>
      </TableCell>

      <TableCell className="py-3 px-4 text-foreground/90 font-medium text-xs border-r border-border/60 leading-relaxed align-top">
        {item_checkpoint.checkpoint}
      </TableCell>

      <TableCell className="py-2.5 px-3 border-r border-border/60 align-top">
        <Input
          value={item_checkpoint.evidencia}
          onChange={(evento) => al_actualizar_evidencia(item_checkpoint.id, evento.target.value)}
          placeholder={translate("pdcaPlan.dynamic.escribeEvidenciasOComentarios")}
          className="h-9 text-xs bg-background/80 hover:bg-background border border-border/80 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 px-3 transition-all placeholder:text-muted-foreground/50 shadow-none"
        />
      </TableCell>

      <TableCell className="py-2.5 px-3 text-center align-top">
        <div className="inline-flex items-center p-0.5 rounded-lg bg-secondary/80 border border-border/80 shadow-inner">
          <button
            type="button"
            onClick={() => al_actualizar_estatus(item_checkpoint.id, "YES")}
            className={cn(
              "px-2.5 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1",
              item_checkpoint.status === "YES"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <Check className="size-3.5 stroke-[3]" /> {translate("pdcaPlan.dynamic.yes")}
          </button>
          <button
            type="button"
            onClick={() => al_actualizar_estatus(item_checkpoint.id, "NO")}
            className={cn(
              "px-2.5 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1",
              item_checkpoint.status === "NO"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <X className="size-3.5 stroke-[3]" /> {translate("pdcaPlan.dynamic.no")}
          </button>
          <button
            type="button"
            onClick={() => al_actualizar_estatus(item_checkpoint.id, "N/A")}
            className={cn(
              "px-2 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1",
              item_checkpoint.status === "N/A"
                ? "bg-slate-600 text-white shadow-md ring-2 ring-slate-500/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            {translate("pdcaPlan.dynamic.nA")}
          </button>
        </div>
      </TableCell>
    </TableRow>
  );
}
