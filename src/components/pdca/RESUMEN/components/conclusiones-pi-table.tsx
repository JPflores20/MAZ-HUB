import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ConclusionesPiItem } from "@/data/pdca";

interface Props {
  elementosPi: ConclusionesPiItem[];
  alAgregarPi: () => void;
  alActualizarPi: (id: string, campo: keyof ConclusionesPiItem, valor: string) => void;
  alEliminarPi: (id: string) => void;
}

export const TablaConclusionesPi: React.FC<Props> = ({
  elementosPi,
  alAgregarPi,
  alActualizarPi,
  alEliminarPi,
}) => {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button onClick={alAgregarPi} variant="outline" size="sm" className="h-8">
          <Plus className="size-4 mr-2" /> {t('pdcaResumen.addPi')}
        </Button>
      </div>
      <div className="border rounded-md overflow-hidden bg-white shadow-sm">
        <Table className="text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">{t('pdcaResumen.pi')}</TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">{t('pdcaResumen.from')}</TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">{t('pdcaResumen.to')}</TableHead>
              <TableHead className="font-bold text-white text-center border-r border-white/20 h-10">
                {t('pdcaResumen.greenIs')}
              </TableHead>
              <TableHead className="font-bold text-white text-center h-10">{t('pdcaResumen.improvementPercent')}</TableHead>
              <TableHead className="w-8 h-10"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!elementosPi || elementosPi.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  {t('pdcaResumen.noPiAdded')}
                </TableCell>
              </TableRow>
            )}
            {elementosPi?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-0 border-r border-border">
                  <Input
                    value={item.piName}
                    onChange={(e) => alActualizarPi(item.id, "piName", e.target.value)}
                    className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-border">
                  <Input
                    value={item.piDe}
                    onChange={(e) => alActualizarPi(item.id, "piDe", e.target.value)}
                    className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-border">
                  <Input
                    value={item.piA}
                    onChange={(e) => alActualizarPi(item.id, "piA", e.target.value)}
                    className="h-10 text-xs shadow-none border-0 rounded-none text-center focus-visible:ring-0"
                  />
                </TableCell>
                <TableCell className="p-0 border-r border-border">
                  <Select
                    value={item.piVerdeEs || "Más alto"}
                    onValueChange={(v) => alActualizarPi(item.id, "piVerdeEs", v)}
                  >
                    <SelectTrigger className="h-10 text-xs border-0 rounded-none shadow-none focus:ring-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Más alto">{t('pdcaResumen.higher')}</SelectItem>
                      <SelectItem value="Más bajo">{t('pdcaResumen.lower')}</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell className="p-0 bg-[#00B050]">
                  <Input
                    value={item.piMejora}
                    onChange={(e) => alActualizarPi(item.id, "piMejora", e.target.value)}
                    className="h-10 text-xs font-bold text-white shadow-none border-0 rounded-none text-center focus-visible:ring-0 bg-transparent placeholder:text-white/70"
                    placeholder="%"
                  />
                </TableCell>
                <TableCell className="p-0 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:bg-red-900/20"
                    onClick={() => alEliminarPi(item.id)}
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
