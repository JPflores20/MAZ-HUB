/**
 * @fileoverview Tabla editable de categorías y brechas (gaps) con porcentajes individual y acumulado.
 */
import { X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/ui/table";
import type { ParetoDataTableProps } from "./pareto_types";

/**
 * Renderiza la tabla interactiva sincronizada con el diagrama de Pareto.
 */
export function ParetoDataTable({
  pareto_data,
  raw_items,
  on_row_update,
  on_row_remove,
  format_value,
  total_gap,
}: ParetoDataTableProps) {
  return (
    <div className="overflow-x-auto border rounded-md">
      <Table className="text-xs">
        <TableHeader className="bg-[#0078D7] [&_th]:text-white">
          <TableRow className="hover:bg-[#0078D7]">
            <TableHead className="py-2 px-3 font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
              ÁREA / CATEGORÍA
            </TableHead>
            <TableHead className="py-2 px-3 w-24 font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
              VALOR (GAP)
            </TableHead>
            <TableHead className="py-2 px-3 w-20 font-bold uppercase text-[10px] tracking-wider text-white border-r border-white/20">
              % IND.
            </TableHead>
            <TableHead className="py-2 px-3 w-20 font-bold uppercase text-[10px] tracking-wider text-white">
              % ACUM.
            </TableHead>
            <TableHead className="w-10 text-white" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {pareto_data.map((fila_pareto) => (
            <TableRow key={fila_pareto.id}>
              <TableCell className="py-1.5 px-3">
                <Input
                  value={fila_pareto.area}
                  onChange={(evento) =>
                    on_row_update(fila_pareto.id, "area", evento.target.value)
                  }
                  placeholder="Ej. Envasado..."
                  className="h-7 text-xs shadow-none border-0 px-1 bg-transparent hover:bg-secondary/50 focus-visible:bg-background"
                />
              </TableCell>
              <TableCell className="py-1.5 px-3">
                <Input
                  type="number"
                  value={fila_pareto.gap || ""}
                  onChange={(evento) =>
                    on_row_update(fila_pareto.id, "gap", Number(evento.target.value))
                  }
                  className="h-7 text-xs shadow-none border-0 px-1 bg-transparent hover:bg-secondary/50 focus-visible:bg-background text-right"
                />
              </TableCell>
              <TableCell className="py-1.5 px-3 font-mono text-muted-foreground">
                {fila_pareto.ind_pct.toFixed(1)}%
              </TableCell>
              <TableCell className="py-1.5 px-3 font-mono text-muted-foreground font-semibold">
                {fila_pareto.cum_pct.toFixed(1)}%
              </TableCell>
              <TableCell className="py-1.5">
                {raw_items.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => on_row_remove(fila_pareto.id)}
                  >
                    <X className="size-3" />
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
          <TableRow className="bg-secondary/20">
            <TableCell className="py-2 px-3 font-bold text-right">TOTAL</TableCell>
            <TableCell className="py-2 px-3 font-bold font-mono text-right">
              {format_value(total_gap)}
            </TableCell>
            <TableCell className="py-2 px-3 font-bold font-mono">100%</TableCell>
            <TableCell colSpan={2} />
          </TableRow>
        </TableBody>
      </Table>
    </div>
  );
}
