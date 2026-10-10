import React, { useRef } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Trash2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TextareaAutosize from "react-textarea-autosize";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TablaEstandarizacionVpoItem } from "@/data/pdca-types";

interface TablaEstandarizacionVpoProps {
  items: TablaEstandarizacionVpoItem[];
  onChange: (items: TablaEstandarizacionVpoItem[]) => void;
}

export const TablaEstandarizacionVpo: React.FC<TablaEstandarizacionVpoProps> = ({
  items,
  onChange,
}) => {
  const { t } = useTranslation();
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  const handleAdd = () => {
    const newItem: TablaEstandarizacionVpoItem = {
      id: crypto.randomUUID(),
      nombreEstandar: "",
      herramientaVpo: "",
      dueno: "",
      equipoComunicara: "",
      datosEntrenamiento: "",
      gopPresentacion: "",
      fechaFinalizacion: "",
      status: "",
      evidencia: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof TablaEstandarizacionVpoItem, value: string) => {
    const newItems = (items || []).map((item) =>
      item.id === id ? { ...item, [field]: value } : item,
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange((items || []).filter((item) => item.id !== id));
  };

  const handleFileChange = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleUpdate(id, "evidencia", reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (id: string) => {
    handleUpdate(id, "evidencia", "");
    if (fileInputRefs.current[id]) {
      fileInputRefs.current[id]!.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-700">{t('pdcaAct.tablaEstandarizacionVpoTitle')}</h3>
        <Button onClick={handleAdd} variant="outline" size="sm">
          <Plus className="size-4 mr-2" /> {t('pdcaAct.agregarFila')}
        </Button>
      </div>

      <div className="border rounded-md overflow-x-auto bg-white shadow-sm">
        <Table className="min-w-[1200px] text-xs">
          <TableHeader>
            <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.nombreEstandar')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.herramientaVpo')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.duenoResponsable')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] min-w-[150px]">
                {t('pdcaAct.equipoComunicara')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] min-w-[150px]">
                {t('pdcaAct.datosEntrenamiento')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] min-w-[150px]">
                {t('pdcaAct.gopPresentacionMejoresPracticasVpo')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.fechaFinalizacion')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px]">
                {t('pdcaAct.status')}
              </TableHead>
              <TableHead className="font-bold text-white uppercase text-center border-r border-white/20 text-[10px] w-24">
                {t('pdcaAct.evidencia')}
              </TableHead>
              <TableHead className="w-12 border-none"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(!items || items.length === 0) && (
              <TableRow>
                <TableCell colSpan={10} className="text-center py-6 text-muted-foreground">
                  {t('pdcaAct.noRegistrosEstandarizacion')}
                </TableCell>
              </TableRow>
            )}
            {items?.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="p-1.5 align-top">
                  <TextareaAutosize
                    value={item.nombreEstandar}
                    onChange={(e) => handleUpdate(item.id, "nombreEstandar", e.target.value)}
                    minRows={2}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <TextareaAutosize
                    value={item.herramientaVpo}
                    onChange={(e) => handleUpdate(item.id, "herramientaVpo", e.target.value)}
                    minRows={2}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <TextareaAutosize
                    value={item.dueno}
                    onChange={(e) => handleUpdate(item.id, "dueno", e.target.value)}
                    minRows={2}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <TextareaAutosize
                    value={item.equipoComunicara}
                    onChange={(e) => handleUpdate(item.id, "equipoComunicara", e.target.value)}
                    minRows={2}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <TextareaAutosize
                    value={item.datosEntrenamiento}
                    onChange={(e) => handleUpdate(item.id, "datosEntrenamiento", e.target.value)}
                    minRows={2}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <TextareaAutosize
                    value={item.gopPresentacion}
                    onChange={(e) => handleUpdate(item.id, "gopPresentacion", e.target.value)}
                    minRows={2}
                    className="w-full rounded-md border border-input bg-transparent px-2 py-1.5 text-xs shadow-none placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none text-justify overflow-hidden"
                    style={{ overflow: "hidden" }}
                    placeholder="..."
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <Input
                    type="date"
                    value={item.fechaFinalizacion}
                    onChange={(e) => handleUpdate(item.id, "fechaFinalizacion", e.target.value)}
                    className="h-8 text-xs shadow-none"
                  />
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <select
                    value={item.status || ""}
                    onChange={(e) => handleUpdate(item.id, "status", e.target.value)}
                    className={`w-full h-8 text-xs border rounded-md outline-none cursor-pointer px-2 ${
                      item.status === "Not Started"
                        ? "bg-slate-100 text-slate-700 font-medium"
                        : item.status === "In Progress"
                          ? "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium border-blue-200 dark:border-blue-800"
                          : item.status === "Complete"
                            ? "bg-green-100 text-green-700 font-medium border-green-200"
                            : item.status === "Retrasado"
                              ? "bg-red-100 text-red-700 dark:text-red-300 font-medium border-red-200"
                              : "bg-transparent text-slate-700"
                    }`}
                  >
                    <option value="" className="bg-white text-slate-900 font-normal">
                      {t('pdcaAct.seleccionar')}
                    </option>
                    <option value="Not Started" className="bg-white text-slate-900 font-normal">
                      Not Started
                    </option>
                    <option value="In Progress" className="bg-white text-slate-900 font-normal">
                      In Progress
                    </option>
                    <option value="Complete" className="bg-white text-slate-900 font-normal">
                      Complete
                    </option>
                    <option value="Retrasado" className="bg-white text-slate-900 font-normal">
                      {t('pdcaAct.retrasado')}
                    </option>
                  </select>
                </TableCell>
                <TableCell className="p-1.5 align-top">
                  <div className="flex flex-col items-center justify-center min-h-[60px] border rounded-md border-dashed bg-secondary/20 relative">
                    {item.evidencia && item.evidencia.startsWith("data:") ? (
                      <div className="relative w-full h-16 group">
                        {item.evidencia.startsWith("data:video/") ? (
                          <video
                            src={item.evidencia}
                            className="w-full h-full object-cover rounded-md"
                          />
                        ) : (
                          <img
                            src={item.evidencia}
                            alt="Evidencia"
                            className="w-full h-full object-cover rounded-md"
                          />
                        )}
                        <button
                          onClick={() => removeImage(item.id)}
                          className="absolute -top-2 -right-2 bg-red-500 dark:bg-red-600 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                          title={t('pdcaAct.eliminarEvidencia')}
                        >
                          <X className="size-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <input
                          type="file"
                          accept="image/*,video/*"
                          className="hidden"
                          ref={(el) => {
                            fileInputRefs.current[item.id] = el;
                          }}
                          onChange={(e) => handleFileChange(item.id, e)}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => fileInputRefs.current[item.id]?.click()}
                          title={t('pdcaAct.subirFotoVideo')}
                        >
                          <Upload className="size-4 text-muted-foreground" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-1.5 align-middle text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(item.id)}
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                    title={t('pdcaAct.eliminarFila')}
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
