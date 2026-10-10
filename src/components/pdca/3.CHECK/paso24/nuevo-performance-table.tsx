import React from "react";
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
import { StepCard } from "@/components/ui/step-card";
import type { NuevoPerformanceItem } from "@/data/pdca";
import { useTranslation } from "react-i18next";

interface NuevoPerformanceTableProps {
  items: NuevoPerformanceItem[];
  onChange: (items: NuevoPerformanceItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const NuevoPerformanceTable: React.FC<NuevoPerformanceTableProps> = ({
  items,
  onChange,
  isStepCompleted,
  onToggleStep,
  isNa,
  onToggleNa,
}) => {
  const { t } = useTranslation();
  const handleAdd = () => {
    const newItem: NuevoPerformanceItem = {
      id: crypto.randomUUID(),
      indicador: "",
      antes: "",
      despues: "",
      mejora: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof NuevoPerformanceItem, value: string) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title={t("pdcaTables.newPerformance.title")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {t("pdcaTables.newPerformance.addIndicator")}
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">
                  {t("pdcaTables.newPerformance.indicator")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">{t("pdcaTables.newPerformance.beforeBaseline")}</TableHead>
                <TableHead className="font-bold text-white text-center">
                  {t("pdcaTables.newPerformance.afterImplementation")}
                </TableHead>
                <TableHead className="font-bold text-white text-center">{t("pdcaTables.newPerformance.improvement")}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {t("pdcaTables.newPerformance.noIndicators")}
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.indicador}
                      onChange={(e) => handleUpdate(item.id, "indicador", e.target.value)}
                      placeholder={t("pdcaTables.newPerformance.placeholders.indicator")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.antes}
                      onChange={(e) => handleUpdate(item.id, "antes", e.target.value)}
                      placeholder={t("pdcaTables.newPerformance.placeholders.initialValue")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.despues}
                      onChange={(e) => handleUpdate(item.id, "despues", e.target.value)}
                      placeholder={t("pdcaTables.newPerformance.placeholders.finalValue")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.mejora}
                      onChange={(e) => handleUpdate(item.id, "mejora", e.target.value)}
                      placeholder={t("pdcaTables.newPerformance.placeholders.improvement")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:bg-red-900/20"
                      onClick={() => handleDelete(item.id)}
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
    </StepCard>
  );
};
