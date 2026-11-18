/**
 * @fileoverview Tabla editable de evolución final de Indicadores de Proceso (PIs) para conclusiones.
 */
import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/ui/select";
import type { ConclusionesPiItem } from "@/domain/pdca";

interface PropiedadesConclusionesPi {
  elementos_pi: ConclusionesPiItem[];
  al_agregar_pi: () => void;
  al_actualizar_pi: (pi_id: string, campo: keyof ConclusionesPiItem, valor: string) => void;
  al_eliminar_pi: (pi_id: string) => void;
}

/**
 * Permite capturar múltiples PIs impactados con valores inicial, final, dirección verde y % mejora.
 */
export const TablaConclusionesPi: React.FC<PropiedadesConclusionesPi> = ({
  elementos_pi,
  al_agregar_pi,
  al_actualizar_pi,
  al_eliminar_pi,
}) => {
  const { t: translate } = useTranslation();

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button onClick={al_agregar_pi} variant="outline" size="sm" className="h-8">
          <Plus className="size-4 mr-2" /> {translate("pdcaResumen.addPi")}
        </Button>
      </div>
      <div className="border rounded-md overflow-hidden bg-white shadow-sm">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">
                {translate("pdcaResumen.pi")}
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">
                {translate("pdcaResumen.from")}
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">
                {translate("pdcaResumen.to")}
              </TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">
                {translate("pdcaResumen.greenIs")}
              </TableHead>
              <TableHead className="font-bold text-white text-center h-10">
                {translate("pdcaResumen.improvementPercent")}
              </TableHead>
              <TableHead className="w-8 h-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!elementos_pi || elementos_pi.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  {translate("pdcaResumen.noPiAdded")}
                </TableCell>
              </TableRow>
            )}
            {elementos_pi?.map((registro_pi) => (
              <TableRow key={registro_pi.id}>
                <TableCell className="p-0 border-r border-border">
                  <Input
                    value={registro_pi.piName}
                    onChange={(evento) => al_actualizar_pi(registro_pi.id, "piName", evento.target.value)}
                    className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-border">
                  <Input
                    value={registro_pi.piDe}
                    onChange={(evento) => al_actualizar_pi(registro_pi.id, "piDe", evento.target.value)}
                    className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-border">
                  <Input
                    value={registro_pi.piA}
                    onChange={(evento) => al_actualizar_pi(registro_pi.id, "piA", evento.target.value)}
                    className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-border">
                  <Select
                    value={registro_pi.piVerdeEs || "Más alto"}
                    onValueChange={(opcion) => al_actualizar_pi(registro_pi.id, "piVerdeEs", opcion)}
                  >
                    <SelectTrigger className="h-10 text-xs border-0 rounded-none shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Más alto">{translate("pdcaResumen.higher")}</SelectItem>
                      <SelectItem value="Más bajo">{translate("pdcaResumen.lower")}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-0 bg-[#00B050]">
                  <Input
                    value={registro_pi.piMejora}
                    onChange={(evento) => al_actualizar_pi(registro_pi.id, "piMejora", evento.target.value)}
                    className="h-10 text-xs font-bold text-white shadow-none border-0 rounded-none text-center focus-visible:ring-0 bg-transparent placeholder:text-white/70"
                    placeholder="%"
                  />
                </TableCell>
                <TableCell className="p-0 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:bg-red-900/20"
                    onClick={() => al_eliminar_pi(registro_pi.id)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
