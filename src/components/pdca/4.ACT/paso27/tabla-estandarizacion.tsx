import React from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import TextareaAutosize from "react-textarea-autosize";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StepInstructions } from "../../step-instructions";
import type { TablaEstandarizacionItem } from "@/data/pdca";

interface TablaEstandarizacionProps {
  items: TablaEstandarizacionItem[];
  onChange: (items: TablaEstandarizacionItem[]) => void;
}

export const TablaEstandarizacion: React.FC<TablaEstandarizacionProps> = ({ items, onChange }) => {
  const { t } = useTranslation();
  const handleAdd = () => {
    const newItem: TablaEstandarizacionItem = {
      id: crypto.randomUUID(),
      accionesMitigar: "",
      herramientaVpo: "",
      dueno: "",
      equipoComunicara: "",
      datosEntrenamiento: "",
      gopPresentacion: "",
      fechaFinalizacion: "",
    };
    onChange([...items, newItem]);
  };

  const handleUpdate = (id: string, field: keyof TablaEstandarizacionItem, value: string) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <StepInstructions>
        <ol className="list-decimal pl-4 space-y-1">
          <li>{t('pdcaAct.instruccion1')}</li>
          <li>{t('pdcaAct.instruccion2')}</li>
          <li>{t('pdcaAct.instruccion3')}</li>
          <li>{t('pdcaAct.instruccion4')}</li>
          <li>{t('pdcaAct.instruccion5')}</li>
        </ol>
      </StepInstructions>

      <div className="flex items-center justify-end">
        <Button onClick={handleAdd} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> {t('pdcaAct.agregarFila')}
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[1000px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.accionesMitigar')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.herramientaVpo')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.dueno')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.equipoComunicara')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.datosEntrenamiento')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.gopPresentacionMejoresPracticas')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.fechaFinalizacion')}
              </TableHead>
              <TableHead className="w-12 border-none"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-6 text-muted-foreground">
                  {t('pdcaAct.noRegistrosEstandarizacion')}
                </TableCell>
              </TableRow>
            )}
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-1.5 border-r border-border">
                  <TextareaAutosize
                    value={item.accionesMitigar || ""}
                    onChange={(e) => handleUpdate(item.id, "accionesMitigar", e.target.value)}
                    placeholder="..."
                    minRows={1}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-none resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <TextareaAutosize
                    value={item.herramientaVpo || ""}
                    onChange={(e) => handleUpdate(item.id, "herramientaVpo", e.target.value)}
                    placeholder="..."
                    minRows={1}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-none resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <TextareaAutosize
                    value={item.dueno || ""}
                    onChange={(e) => handleUpdate(item.id, "dueno", e.target.value)}
                    placeholder="..."
                    minRows={1}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-none resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <TextareaAutosize
                    value={item.equipoComunicara || ""}
                    onChange={(e) => handleUpdate(item.id, "equipoComunicara", e.target.value)}
                    placeholder="..."
                    minRows={1}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-none resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <TextareaAutosize
                    value={item.datosEntrenamiento || ""}
                    onChange={(e) => handleUpdate(item.id, "datosEntrenamiento", e.target.value)}
                    placeholder="..."
                    minRows={1}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-none resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                  />
                </TableCell>
                <TableCell className="p-1.5 border-r border-border">
                  <TextareaAutosize
                    value={item.gopPresentacion || ""}
                    onChange={(e) => handleUpdate(item.id, "gopPresentacion", e.target.value)}
                    placeholder="..."
                    minRows={1}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-none resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                  />
                </TableCell>
                <TableCell className="p-1.5">
                  <DatePicker
                    date={item.fechaFinalizacion ? new Date(item.fechaFinalizacion) : undefined}
                    setDate={(date) =>
                      handleUpdate(item.id, "fechaFinalizacion", date ? date.toISOString() : "")
                    }
                    className="w-full h-7 text-xs border-0 bg-transparent px-2 shadow-none"
                    placeholder={t('pdcaAct.seleccionar')}
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
  );
};
