import { useTranslation } from "react-i18next";
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { RdaPortada } from "@/data/rda";
import { TeamMembersInput } from "@/components/pdca/team-members-input";
import {
  PdcaGoalDefinition,
  DEFAULT_DEFINICION_META,
} from "@/components/pdca/1.PLAN/paso1/pdca-goal-definition";
import { PdcaParticipants } from "@/components/pdca/1.PLAN/paso1/pdca-participants";
import { DEFAULT_PARTICIPANTES, AREAS } from "@/data/pdca-defaults";
import { format, parseISO } from "date-fns";

interface RdaPortadaTabProps {
  data: RdaPortada;
  onChange: (data: RdaPortada) => void;
}

export function RdaPortadaTab({ data, onChange }: RdaPortadaTabProps) {
  const { t } = useTranslation();

  const handleChange = (field: keyof RdaPortada, value: any) => {
    onChange({ ...data, [field]: value });
  };

  // Helper to ensure date is correctly formatted/parsed
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      handleChange("fechaLimite", format(date, "yyyy-MM-dd"));
    } else {
      handleChange("fechaLimite", "");
    }
  };

  const currentLimitDate = data.fechaLimite ? parseISO(data.fechaLimite) : undefined;

  const normalizedArea =
    AREAS.find(
      (a) =>
        a.value.toLowerCase() === data.area?.toLowerCase() ||
        a.label.toLowerCase() === data.area?.toLowerCase(),
    )?.label ||
    data.area ||
    "";

  return (
    <div className="space-y-8">
      {/* Información principal */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            {t("rdaInternal.projectTitle")}
          </Label>
          <Input
            value={data.titulo || ""}
            onChange={(e) => handleChange("titulo", e.target.value)}
            placeholder="Ej. Incrementar el Índice..."
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            {t("rda.area")}
          </Label>
          <Select value={normalizedArea} onValueChange={(val) => handleChange("area", val)}>
            <SelectTrigger>
              <SelectValue placeholder="Seleccionar..." />
            </SelectTrigger>
            <SelectContent>
              {AREAS.map((areaOption) => (
                <SelectItem key={areaOption.value} value={areaOption.label}>
                  {areaOption.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            {t("rda.deadline")}
          </Label>
          <DatePicker date={currentLimitDate} setDate={handleDateChange} />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            {t("rdaInternal.originalAuthor")}
          </Label>
          <Input
            value={data.autorOriginal || ""}
            onChange={(e) => handleChange("autorOriginal", e.target.value)}
            placeholder="Ej. AXEL GUILLEN RAMIREZ"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-semibold text-muted-foreground uppercase">
            {t("rdaInternal.authorEmail")}
          </Label>
          <Input
            value={data.autorEmail || ""}
            onChange={(e) => handleChange("autorEmail", e.target.value)}
            placeholder="Ej. axel@ab-inbev.com"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">
          {t("rdaInternal.assignedUsers")}
        </Label>
        <TeamMembersInput
          members={data.usuariosAsignados || []}
          onChange={(members) => handleChange("usuariosAsignados", members)}
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">
          {t("rdaInternal.problemDescription")}
        </Label>
        <Textarea
          value={data.descripcionProblema || ""}
          onChange={(e) => handleChange("descripcionProblema", e.target.value)}
          placeholder="Escribe la descripción general del problema aquí..."
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2 pt-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
          {t("rdaInternal.goalDefinition")}
        </Label>
        <div className="border rounded-md overflow-hidden">
          <PdcaGoalDefinition
            value={data.definicionMeta || DEFAULT_DEFINICION_META}
            onChange={(meta) => handleChange("definicionMeta", meta)}
          />
        </div>
      </div>

      <div className="space-y-2 pt-4">
        <Label className="text-xs font-semibold text-muted-foreground uppercase mb-2 block">
          {t("rdaInternal.participants")}
        </Label>
        <div className="border rounded-md overflow-hidden">
          <PdcaParticipants
            value={data.participantes || DEFAULT_PARTICIPANTES}
            onChange={(parts) => handleChange("participantes", parts)}
          />
        </div>
      </div>
    </div>
  );
}
