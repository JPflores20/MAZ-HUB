import React from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { type VpoCheckpointItem } from "@/data/pdca";
import { useTranslation } from "react-i18next";

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
  itemCheckpoint: VpoCheckpointItem;
  alActualizarEvidencia: (id: string, texto: string) => void;
  alActualizarEstatus: (id: string, nuevoEstatus: "YES" | "NO" | "N/A" | "") => void;
}

export function FilaCheckpointVpo({
  itemCheckpoint,
  alActualizarEvidencia,
  alActualizarEstatus,
}: PropiedadesFilaVpo) {
    const { t } = useTranslation();
  const estiloPilar = MAPA_ESTILOS_PILAR[itemCheckpoint.pilar] || {
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
            estiloPilar.bg,
            estiloPilar.text,
            estiloPilar.border,
          )}
        >
          {itemCheckpoint.pilar}
        </span>
      </TableCell>

      <TableCell className="py-3 px-4 text-foreground/90 font-medium text-xs border-r border-border/60 leading-relaxed align-top">
        {itemCheckpoint.checkpoint}
      </TableCell>

      <TableCell className="py-2.5 px-3 border-r border-border/60 align-top">
        <Input
          value={itemCheckpoint.evidencia}
          onChange={(eventoCambioEntrada) =>
            alActualizarEvidencia(itemCheckpoint.id, eventoCambioEntrada.target.value)
          }
          placeholder={t('pdcaPlan.dynamic.escribeEvidenciasOComentarios')}
          className="h-9 text-xs bg-background/80 hover:bg-background border border-border/80 rounded-lg focus-within:ring-2 focus-within:ring-blue-500/30 focus-within:border-blue-500 px-3 transition-all placeholder:text-muted-foreground/50 shadow-none"
        />
      </TableCell>

      <TableCell className="py-2.5 px-3 text-center align-top">
        <div className="inline-flex items-center p-0.5 rounded-lg bg-secondary/80 border border-border/80 shadow-inner">
          <button
            type="button"
            onClick={() => alActualizarEstatus(itemCheckpoint.id, "YES")}
            className={cn(
              "px-2.5 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1",
              itemCheckpoint.status === "YES"
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-500/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <Check className="size-3.5 stroke-[3]" /> {t('pdcaPlan.dynamic.yes')}</button>
          <button
            type="button"
            onClick={() => alActualizarEstatus(itemCheckpoint.id, "NO")}
            className={cn(
              "px-2.5 py-1 text-xs font-extrabold rounded-md transition-all flex items-center gap-1",
              itemCheckpoint.status === "NO"
                ? "bg-rose-600 text-white shadow-md shadow-rose-600/30 ring-2 ring-rose-500/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            <X className="size-3.5 stroke-[3]" /> {t('pdcaPlan.dynamic.no')}</button>
          <button
            type="button"
            onClick={() => alActualizarEstatus(itemCheckpoint.id, "N/A")}
            className={cn(
              "px-2 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1",
              itemCheckpoint.status === "N/A"
                ? "bg-slate-600 text-white shadow-md ring-2 ring-slate-500/50"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50",
            )}
          >
            {t('pdcaPlan.dynamic.nA')}</button>
        </div>
      </TableCell>
    </TableRow>
  );
}
