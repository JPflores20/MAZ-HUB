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
import type { AnalisisRiesgoItem } from "@/data/pdca";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslation } from "react-i18next";

interface AnalisisRiesgosTableProps {
  items: AnalisisRiesgoItem[];
  onChange: (items: AnalisisRiesgoItem[]) => void;
  title: string;
  isStepCompleted?: boolean;
  isNa?: boolean | undefined;
  onToggleStep?: () => void;
  onToggleNa?: (() => void) | undefined;
}

export const AnalisisRiesgosTable: React.FC<AnalisisRiesgosTableProps> = ({ items, onChange, title, isStepCompleted, onToggleStep, isNa, onToggleNa }) => {
    const { t } = useTranslation();
  const handleAdd = () => {
    const newItem: AnalisisRiesgoItem = {
      id: crypto.randomUUID(),
      riesgo: "",
      tipo_impacto: "",
      probabilidad: "",
      impacto: "",
      prioridad: "",
      mitigacion: "",
      responsable: "",
      fecha_limite: "",
    };
    onChange([...(items || []), newItem]);
  };

  const handleUpdate = (id: string, field: keyof AnalisisRiesgoItem, value: string) => {
    const newItems = items.map((item) =>
      item.id === id ? { ...item, [field]: value } : item
    );
    onChange(newItems);
  };

  const handleDelete = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  const calculateRPN = (prob: string, imp: string, prio: string) => {
    const p = parseInt(prob) || 0;
    const i = parseInt(imp) || 0;
    const pr = parseInt(prio) || 0;
    return p * i * pr;
  };

  const getTrafficLightClass = (value: string | undefined) => {
    if (value === "1" || value === "2") return "bg-green-100 border-green-300 text-green-800 font-medium";
    if (value === "3") return "bg-orange-100 border-orange-300 text-orange-800 font-medium";
    if (value === "4") return "bg-red-100 border-red-300 text-red-800 font-medium";
    return "";
  };

  const getRpnColorClass = (rpn: number) => {
    if (rpn <= 0) return "";
    if (rpn <= 8) return "bg-green-100 text-green-800";
    if (rpn <= 27) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <StepCard
      title={title}
      isStepCompleted={isStepCompleted}
      onToggleStep={onToggleStep}
      isNa={isNa}
      onToggleNa={onToggleNa}
    >
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button onClick={handleAdd} variant="outline" size="sm">
            <Plus className="size-4 mr-2" /> {t('pdcaPlan.dynamic.agregarRiesgo')}</Button>
        </div>

        <div className="border rounded-md overflow-x-auto shadow-sm">
          <Table className="min-w-[1000px] text-[11px]">
            <TableHeader>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead rowSpan={2} className="font-bold text-white text-center w-10 border-r border-white/40">{t('pdcaPlan.dynamic.noDeRiesgo')}</TableHead>
                <TableHead rowSpan={2} className="font-bold text-white text-center min-w-[200px] border-r border-white/40">{t('pdcaPlan.dynamic.descripciNDelRiesgo')}</TableHead>
                <TableHead className="font-bold text-white text-center w-28 border-r border-white/40 border-b border-white/40">{t('pdcaPlan.dynamic.tipoDeImpacto')}</TableHead>
                <TableHead className="font-bold text-white text-center w-32 border-r border-white/40 border-b border-white/40">{t('pdcaPlan.dynamic.probabilidad')}</TableHead>
                <TableHead className="font-bold text-white text-center w-32 border-r border-white/40 border-b border-white/40">{t('pdcaPlan.dynamic.impacto')}</TableHead>
                <TableHead className="font-bold text-white text-center w-32 border-r border-white/40 border-b border-white/40">{t('pdcaPlan.dynamic.prioridad')}</TableHead>
                <TableHead rowSpan={2} className="font-bold text-white text-center w-24 border-r border-white/40">{t('pdcaPlan.dynamic.rpn')}<br/><span className="text-[9px] font-normal">{t('pdcaPlan.dynamic.probabilidadXImpactoXPrioridad')}</span></TableHead>
                <TableHead colSpan={3} className="font-bold text-white text-center border-b border-white/40">{t('pdcaPlan.dynamic.respuestaAlRiesgo')}</TableHead>
                <TableHead rowSpan={2} className="w-10 border-l border-white/40"></TableHead>
              </TableRow>
              <TableRow className="bg-[#0078D7] hover:bg-[#0078D7]">
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {t('pdcaPlan.dynamic.alcance')}{"\n"}{t('pdcaPlan.dynamic.costo')}{"\n"}{t('pdcaPlan.dynamic.tiempo')}</TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {t('pdcaPlan.dynamic.1Nada')}{"\n"}{t('pdcaPlan.dynamic.2Bajo')}{"\n"}{t('pdcaPlan.dynamic.3Medio')}{"\n"}{t('pdcaPlan.dynamic.4Alto')}</TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {t('pdcaPlan.dynamic.1Nada')}{"\n"}{t('pdcaPlan.dynamic.2Bajo')}{"\n"}{t('pdcaPlan.dynamic.3Moderado')}{"\n"}{t('pdcaPlan.dynamic.4Alto')}</TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {t('pdcaPlan.dynamic.1Nada')}{"\n"}{t('pdcaPlan.dynamic.2Bajo')}{"\n"}{t('pdcaPlan.dynamic.3Medio')}{"\n"}{t('pdcaPlan.dynamic.4Alto')}</TableHead>
                <TableHead className="font-bold text-white text-center text-[10px] leading-tight border-r border-white/40 whitespace-pre-line">
                  {t('pdcaPlan.dynamic.aceptar')}{"\n"}{t('pdcaPlan.dynamic.evitar')}{"\n"}{t('pdcaPlan.dynamic.mitigar')}</TableHead>
                <TableHead className="font-bold text-white text-center border-r border-white/40">{t('pdcaPlan.dynamic.responsable2')}</TableHead>
                <TableHead className="font-bold text-white text-center">{t('pdcaPlan.dynamic.fechaLMite2')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(!items || items.length === 0) && (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-6 text-muted-foreground">
                    {t('pdcaPlan.dynamic.noHayRiesgosIdentificados')}</TableCell>
                </TableRow>
              )}
              {items?.map((item, index) => {
                const rpn = calculateRPN(item.probabilidad, item.impacto, item.prioridad || "");
                return (
                  <TableRow key={item.id}>
                    <TableCell className="p-1.5 text-center font-bold">
                      {index + 1}
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        value={item.riesgo}
                        onChange={(e) => handleUpdate(item.id, "riesgo", e.target.value)}
                        placeholder={t('pdcaPlan.dynamic.ejFallaDeEquipo')}
                        className="h-8 text-xs shadow-none"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={item.tipo_impacto || ""}
                        onValueChange={(v) => handleUpdate(item.id, "tipo_impacto", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('pdcaPlan.dynamic.seleccionar')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Scope">{t('pdcaPlan.dynamic.scopeAlcance')}</SelectItem>
                          <SelectItem value="Cost">{t('pdcaPlan.dynamic.costCosto')}</SelectItem>
                          <SelectItem value="Time">{t('pdcaPlan.dynamic.timeTiempo')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={item.probabilidad || ""}
                        onValueChange={(v) => handleUpdate(item.id, "probabilidad", v)}
                      >
                        <SelectTrigger className={`h-8 text-xs text-center ${getTrafficLightClass(item.probabilidad)}`}>
                          <SelectValue placeholder="1-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t('pdcaPlan.dynamic.1Nada')}</SelectItem>
                          <SelectItem value="2">{t('pdcaPlan.dynamic.2Bajo')}</SelectItem>
                          <SelectItem value="3">{t('pdcaPlan.dynamic.3Medio')}</SelectItem>
                          <SelectItem value="4">{t('pdcaPlan.dynamic.4Alto')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={item.impacto || ""}
                        onValueChange={(v) => handleUpdate(item.id, "impacto", v)}
                      >
                        <SelectTrigger className={`h-8 text-xs text-center ${getTrafficLightClass(item.impacto)}`}>
                          <SelectValue placeholder="1-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t('pdcaPlan.dynamic.1Nada')}</SelectItem>
                          <SelectItem value="2">{t('pdcaPlan.dynamic.2Bajo')}</SelectItem>
                          <SelectItem value="3">{t('pdcaPlan.dynamic.3Moderado')}</SelectItem>
                          <SelectItem value="4">{t('pdcaPlan.dynamic.4Alto')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={item.prioridad || ""}
                        onValueChange={(v) => handleUpdate(item.id, "prioridad", v)}
                      >
                        <SelectTrigger className={`h-8 text-xs text-center ${getTrafficLightClass(item.prioridad)}`}>
                          <SelectValue placeholder="1-4" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">{t('pdcaPlan.dynamic.1Nada')}</SelectItem>
                          <SelectItem value="2">{t('pdcaPlan.dynamic.2Bajo')}</SelectItem>
                          <SelectItem value="3">{t('pdcaPlan.dynamic.3Medio')}</SelectItem>
                          <SelectItem value="4">{t('pdcaPlan.dynamic.4Alto')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className={`p-1.5 text-center font-bold text-sm ${rpn > 0 ? getRpnColorClass(rpn) + ' rounded-md border border-black/10' : ''}`}>
                      {rpn > 0 ? rpn : "-"}
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Select
                        value={item.mitigacion || ""}
                        onValueChange={(v) => handleUpdate(item.id, "mitigacion", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder={t('pdcaPlan.dynamic.respuesta')} />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Accept">{t('pdcaPlan.dynamic.accept')}</SelectItem>
                          <SelectItem value="Avoid">{t('pdcaPlan.dynamic.avoid')}</SelectItem>
                          <SelectItem value="Mitigate">{t('pdcaPlan.dynamic.mitigate')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        value={item.responsable}
                        onChange={(e) => handleUpdate(item.id, "responsable", e.target.value)}
                        placeholder={t('pdcaPlan.dynamic.responsable3')}
                        className="h-8 text-xs shadow-none"
                      />
                    </TableCell>
                    <TableCell className="p-1.5">
                      <Input
                        type="date"
                        value={item.fecha_limite || ""}
                        onChange={(e) => handleUpdate(item.id, "fecha_limite", e.target.value)}
                        className="h-8 text-xs shadow-none"
                      />
                    </TableCell>
                    <TableCell className="p-1.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </StepCard>
  );
};
