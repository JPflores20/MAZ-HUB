import React, { useState } from "react";
import { Plus, Trash2, X, UploadCloud, RefreshCw, FileText } from "lucide-react";
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
import { StepCard } from "@/components/ui/step-card";
import type { PruebaEjecutadaItem } from "@/data/pdca";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

// â”€â”€â”€ Comprimir imagen antes de subir â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function compressImage(file: File, maxWidth = 2048, quality = 0.85): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (ev) => {
      const img = new Image();
      img.src = ev.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const scale = Math.min(1, maxWidth / img.width);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        canvas.getContext("2d")!.drawImage(img, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error("Compresión fallida"))),
          "image/jpeg",
          quality,
        );
      };
      img.onerror = reject;
    };
    reader.onerror = reject;
  });
}

// â”€â”€â”€ Subir imagen a Firebase Storage â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
async function uploadToFirebase(file: File): Promise<string> {
  const { ref, uploadBytesResumable, getDownloadURL } = await import("firebase/storage");
  const { storage } = await import("@/lib/firebase");

  const uniqueId = Date.now().toString() + Math.random().toString(36).substring(7);
  const fileExt = file.name.split(".").pop() || "jpg";
  const fileName = `uploads/pruebas_ejecutadas_evidencias/${uniqueId}.${fileExt}`;
  const storageRef = ref(storage, fileName);

  let blobToUpload: Blob = file;
  if (file.type.startsWith("image/")) {
    blobToUpload = await compressImage(file);
  }

  const uploadTask = uploadBytesResumable(storageRef, blobToUpload);

  return new Promise((resolve, reject) => {
    uploadTask.on("state_changed", null, reject, async () =>
      resolve(await getDownloadURL(uploadTask.snapshot.ref)),
    );
  });
}

interface PruebasEjecutadasTableProps {
  items: PruebaEjecutadaItem[];
  onChange: (items: PruebaEjecutadaItem[]) => void;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const PruebasEjecutadasTable: React.FC<PruebasEjecutadasTableProps> = ({
  items,
  onChange,
  isStepCompleted,
  isNa,
  onToggleStep,
  onToggleNa,
}) => {
  const { t } = useTranslation();
  const [uploadingRows, setUploadingRows] = useState<Set<string>>(new Set());

  const handleAdd = () => {
    const newItem: PruebaEjecutadaItem = {
      id: crypto.randomUUID(),
      prueba: "",
      fecha: "",
      resultado: "",
      estado: "",
      evidencia: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof PruebaEjecutadaItem, value: string) => {
    const newItems = items.map((item) => (item.id === id ? { ...item, [field]: value } : item));
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <StepCard
      title={t("pdcaTables.executedTests.title")}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {t("pdcaTables.executedTests.addTest")}
          </Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[600px] text-xs">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center">{t("pdcaTables.executedTests.testAction")}</TableHead>
                <TableHead className="font-bold text-white text-center w-36">{t("pdcaTables.executedTests.date")}</TableHead>
                <TableHead className="font-bold text-white text-center">
                  {t("pdcaTables.executedTests.expectedVsActual")}
                </TableHead>
                <TableHead className="font-bold text-white text-center w-32">{t("pdcaTables.executedTests.status")}</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                    {t("pdcaTables.executedTests.noTests")}
                  </TableCell>
                </TableRow>
              )}
              {items?.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.prueba}
                      onChange={(e) => handleUpdate(item.id, "prueba", e.target.value)}
                      placeholder={t("pdcaTables.executedTests.placeholders.description")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      type="date"
                      value={item.fecha}
                      onChange={(e) => handleUpdate(item.id, "fecha", e.target.value)}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Input
                      value={item.resultado}
                      onChange={(e) => handleUpdate(item.id, "resultado", e.target.value)}
                      placeholder={t("pdcaTables.executedTests.placeholders.result")}
                      className="h-8 text-xs shadow-none"
                    />
                  </TableCell>
                  <TableCell className="p-1.5">
                    <Select
                      value={item.estado}
                      onValueChange={(val) => handleUpdate(item.id, "estado", val)}
                    >
                      <SelectTrigger className="h-8 text-xs shadow-none">
                        <SelectValue placeholder={t("pdcaTables.executedTests.status")} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Exitoso">{t("pdcaTables.executedTests.statusOptions.successful")}</SelectItem>
                        <SelectItem value="Fallido">{t("pdcaTables.executedTests.statusOptions.failed")}</SelectItem>
                        <SelectItem value="Pendiente">{t("pdcaTables.executedTests.statusOptions.pending")}</SelectItem>
                      </SelectContent>
                    </Select>
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

        {items && items.filter((item) => item.prueba.trim() !== "").length > 0 && (
          <div className="mt-8 border-t pt-6">
            <h4 className="text-sm font-bold text-slate-700 uppercase mb-4">
              {t("pdcaTables.executedTests.evidencesTitle")}
            </h4>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {items
                .filter((item) => item.prueba.trim() !== "")
                .map((item, i) => {
                  const existing = item.evidencia;
                  const isUploading = uploadingRows.has(item.id);
                  const cardClass = cn(
                    "flex flex-col border rounded-xl p-3 bg-white border-border",
                  );
                  const dropzoneClass = cn(
                    "relative mt-auto h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden group bg-slate-50 dark:bg-slate-900 border-slate-200",
                  );

                  return (
                    <div key={item.id} className={cardClass}>
                      <p
                        className="text-xs font-semibold text-slate-700 mb-2 line-clamp-2"
                        title={item.prueba}
                      >
                        {i + 1}. {item.prueba}
                      </p>
                      <div className={dropzoneClass}>
                        {existing ? (
                          <>
                            {existing.includes("application/pdf") ? (
                              <a
                                href={existing}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center w-full h-full text-red-500 dark:text-red-400 font-bold hover:bg-red-50 dark:bg-red-900/20"
                              >
                                <FileText className="size-8 mr-2" /> PDF
                              </a>
                            ) : (
                              <img
                                src={existing}
                                alt={`Evidencia ${i + 1}`}
                                className="w-full h-full object-contain"
                              />
                            )}
                            <button
                              onClick={() => handleUpdate(item.id, "evidencia", "")}
                              className="absolute top-1 right-1 bg-white/80 p-1 rounded-full opacity-0 group-hover:opacity-100 transition text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-white shadow-sm"
                            >
                              <X className="size-4" />
                            </button>
                          </>
                        ) : isUploading ? (
                          <div className="flex flex-col items-center justify-center text-muted-foreground">
                            <RefreshCw className="size-6 mb-1 animate-spin" />
                            <span className="text-[10px] uppercase font-semibold">{t("pdcaTables.executedTests.uploading")}</span>
                          </div>
                        ) : (
                          <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer text-slate-400 hover:text-primary transition hover:bg-slate-100/50">
                            <UploadCloud className="size-6 mb-1" />
                            <span className="text-[10px] uppercase font-semibold">
                              {t("pdcaTables.executedTests.uploadPhotoPdf")}
                            </span>
                            <input
                              type="file"
                              accept="image/*,application/pdf"
                              className="hidden"
                              onChange={async (e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  try {
                                    setUploadingRows((prev) => new Set(prev).add(item.id));
                                    const url = await uploadToFirebase(file);
                                    handleUpdate(item.id, "evidencia", url);
                                  } catch (error) {
                                    console.error("Error subiendo evidencia:", error);
                                  } finally {
                                    setUploadingRows((prev) => {
                                      const next = new Set(prev);
                                      next.delete(item.id);
                                      return next;
                                    });
                                  }
                                }
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
    </StepCard>
  );
};
