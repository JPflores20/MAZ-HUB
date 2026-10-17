/**
 * subphase_1.tsx
 * Vista modular de la primera subfase de planificación (Definición e Identificación).
 */
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Check, Plus, UserPlus, X } from "lucide-react";
import { PdcaGoalDefinition } from "@/components/pdca/1.PLAN/paso1/pdca-goal-definition";
import { PdcaParticipants } from "@/components/pdca/1.PLAN/paso1/pdca-participants";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { VpoCheckpointTable } from "../paso2/vpo-checkpoint-table";
import { TimeSeriesYTD } from "../paso7/time-series-ytd";
import { MultiImageUploadSection, ALL_ACCEPT_STRING } from "../../image-upload-section";
import { VozConsumidorTable } from "../paso5/voz-consumidor-table";
import { AnalisisRiesgosTable } from "../paso6/analisis-riesgos-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  ResponsibleProfileCard,
  ResponsibleSelectorItem,
  useDirectoryUsers,
} from "@/components/ui/responsible-profile-card";
import { AREAS } from "@/data/pdca";
import { RichTextEditor } from "./rich_text_editor";
import { PhasePlanProps } from "./phase_plan_types";

/**
 * Subfase 1 component: Contains steps 1 to 7 for PDCA Plan Phase.
 */
export const Subphase1: React.FC<PhasePlanProps> = ({
  title_value,
  on_title_change,
  area_value,
  on_area_change,
  deadline_date,
  on_deadline_change,
  author_name,
  author_email,
  on_author_change,
  assigned_users,
  on_toggle_assigned_user,
  available_users,
  is_admin_user,
  problem_description,
  on_problem_change,
  goal_definition,
  on_goal_definition_change,
  participants_info,
  on_participants_info_change,
  vpo_checkpoints,
  on_vpo_checkpoints_change,
  completed_steps,
  na_steps,
  on_toggle_step,
  on_toggle_na,
  is_editable,
  process_mapping_files,
  sipoc_map_files,
  on_sipoc_map_files_change,
  on_process_mapping_files_change,
  voz_consumidor,
  on_voz_consumidor_change,
  analisis_riesgos_proyecto,
  on_analisis_riesgos_proyecto_change,
  target_vs_actual,
  on_target_vs_actual_change,
  target_vs_actual_unit,
  on_target_vs_actual_unit_change,
  target_vs_actual_title,
  on_target_vs_actual_title_change,
  target_vs_actual_ymin,
  on_target_vs_actual_ymin_change,
  target_vs_actual_ymax,
  on_target_vs_actual_ymax_change,
}) => {
  const { t } = useTranslation();
  const [custom_assigned_name, set_custom_assigned_name] = useState("");
  const { directory: directory_users, resolveUser } = useDirectoryUsers(available_users);
  const selectable_users = directory_users.length > 0 ? directory_users : (available_users ?? []);

  const handle_add_custom_assigned = () => {
    const val = custom_assigned_name.trim();
    if (!val) return;
    on_toggle_assigned_user({
      name: val.toUpperCase(),
      email: `${val.toLowerCase().replace(/\s+/g, ".")}@colaborador.local`,
    });
    set_custom_assigned_name("");
  };

  return (
    <div className="space-y-6">
      {/* PASO 1: DECLARACIÓN DEL PROYECTO */}
      <StepCard
        title={t("pdcaPlan.step1Title")}
        isStepCompleted={completed_steps.has("step-1")}
        onToggleStep={() => on_toggle_step("step-1")}
        isNa={na_steps?.has("step-1")}
        onToggleNa={() => on_toggle_na?.("step-1")}
      >
        <StepInstructions>
          <p>{t("pdcaPlan.step1Desc")}</p>
        </StepInstructions>

        <div className="space-y-5 mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 lg:col-span-1">
              <Label className="text-xs font-semibold">{t("pdcaPlan.projectTitle")}</Label>
              <Input
                value={title_value}
                onChange={(e) => on_title_change(e.target.value)}
                disabled={!is_editable}
                placeholder={t("pdcaPlan.projectTitlePlaceholder")}
                className="h-9 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("pdcaPlan.area")}</Label>
              <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t("pdcaPlan.selectArea")} />
                </SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (
                    <SelectItem key={a.value} value={a.value}>
                      {a.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("pdcaPlan.deadline")}</Label>
              <DatePicker
                date={deadline_date}
                setDate={on_deadline_change}
                placeholder={t("pdcaPlan.selectDeadline")}
                disabled={!is_admin_user}
                className="h-9 text-xs w-full"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">{t("pdcaPlan.originalAuthor")}</Label>
              {is_admin_user ? (
                <Select
                  value={author_email}
                  onValueChange={(email) => {
                    const found = selectable_users.find((u) => u.email === email);
                    on_author_change(email, found?.name || "Usuario");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={t("pdcaPlan.selectAuthor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {selectable_users.map((u) => (
                      <SelectItem key={u.email || u.name} value={u.email}>
                        {u.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={author_name} disabled className="h-9 text-xs" />
              )}
            </div>
          </div>

          <div className="space-y-2 rounded-xl border border-border bg-secondary/15 p-3.5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-foreground">
                {t("pdcaPlan.assignedUsers")}
              </Label>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={!is_editable}
                    className="h-8 gap-1.5 text-xs font-semibold"
                  >
                    <UserPlus className="size-3.5 text-primary" />
                    {(assigned_users ?? []).length === 0
                      ? t("pdcaPlan.selectUsers")
                      : "Asignar / quitar responsables"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-3 space-y-2.5" align="end">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Asignar PDCA a varios usuarios
                  </p>
                  <div className="max-h-64 overflow-y-auto space-y-1 border-b border-border pb-2">
                    {selectable_users.map((u) => {
                      const resolved = resolveUser(u);
                      const assigned = (assigned_users ?? []).some(
                        (a) =>
                          (u.email && a.email.toLowerCase() === u.email.toLowerCase()) ||
                          a.name.toLowerCase() === u.name.toLowerCase(),
                      );
                      return (
                        <ResponsibleSelectorItem
                          key={u.email || u.name}
                          user={resolved}
                          selected={assigned}
                          onToggle={() =>
                            on_toggle_assigned_user({
                              name: resolved.name,
                              email: resolved.email,
                            })
                          }
                        />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Input
                      value={custom_assigned_name}
                      onChange={(e) => set_custom_assigned_name(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handle_add_custom_assigned();
                        }
                      }}
                      placeholder="Agregar otro nombre..."
                      className="h-7 text-xs"
                    />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      onClick={handle_add_custom_assigned}
                      className="h-7 w-7 shrink-0"
                    >
                      <Plus className="size-3.5" />
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {(assigned_users ?? []).length === 0 ? (
              <p className="text-xs text-muted-foreground italic py-1">
                No hay responsables asignados aún. Haz clic en el botón superior para seleccionar uno o varios responsables.
              </p>
            ) : (
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {(assigned_users ?? []).map((u) => {
                  const resolved = resolveUser(u);
                  return (
                    <ResponsibleProfileCard
                      key={u.email || u.name}
                      user={resolved}
                      onRemove={is_editable ? () => on_toggle_assigned_user(u) : undefined}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("pdcaPlan.problemDescription")}</Label>
            <RichTextEditor
              value={problem_description}
              onChange={on_problem_change}
              disabled={!is_editable}
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">{t("pdcaPlan.goalDefinition")}</Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                {t("pdcaPlan.formatInbev")}
              </span>
            </div>
            <PdcaGoalDefinition
              value={goal_definition}
              onChange={on_goal_definition_change}
              readOnly={!is_editable}
            />
          </div>

          <div className="space-y-1.5">
            <PdcaParticipants
              value={participants_info}
              onChange={on_participants_info_change}
              readOnly={!is_editable}
            />
          </div>
        </div>
      </StepCard>

      {/* PASO 2: VPO */}
      <VpoCheckpointTable
        checkpoints={vpo_checkpoints}
        onChange={on_vpo_checkpoints_change}
        problemaTexto={problem_description}
        completedSteps={completed_steps}
        naSteps={na_steps}
        onToggleStep={on_toggle_step}
        onToggleNa={on_toggle_na}
      />

      {/* PASO 3: SIPOC MAP */}
      <MultiImageUploadSection
        images={sipoc_map_files || []}
        onChange={(f) => on_sipoc_map_files_change?.(f)}
        title={t("pdcaPlan.step3Title")}
        subtitle={t("pdcaPlan.step3Subtitle")}
        description={t("pdcaPlan.step3Desc")}
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-3")}
        onToggleStep={() => on_toggle_step("step-3")}
        isNa={na_steps?.has("step-3")}
        onToggleNa={() => on_toggle_na?.("step-3")}
      />

      {/* PASO 4: Mapeo de procesos */}
      <MultiImageUploadSection
        images={process_mapping_files || []}
        onChange={(f) => on_process_mapping_files_change?.(f)}
        title={t("pdcaPlan.step4Title")}
        subtitle={t("pdcaPlan.step3Subtitle")}
        description={t("pdcaPlan.step4Desc")}
        maxImages={6}
        acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-4")}
        onToggleStep={() => on_toggle_step("step-4")}
        isNa={na_steps?.has("step-4")}
        onToggleNa={() => on_toggle_na?.("step-4")}
      />

      {/* PASO 5: Voz del Consumidor */}
      <VozConsumidorTable
        items={voz_consumidor || []}
        onChange={on_voz_consumidor_change!}
        isStepCompleted={completed_steps.has("step-5")}
        onToggleStep={() => on_toggle_step("step-5")}
        isNa={na_steps?.has("step-5")}
        onToggleNa={() => on_toggle_na?.("step-5")}
      />

      {/* PASO 6: Análisis de Riesgos */}
      <AnalisisRiesgosTable
        title={t("pdcaPlan.step6Title")}
        items={analisis_riesgos_proyecto || []}
        onChange={on_analisis_riesgos_proyecto_change!}
        isStepCompleted={completed_steps.has("step-6")}
        onToggleStep={() => on_toggle_step("step-6")}
        isNa={na_steps?.has("step-6")}
        onToggleNa={() => on_toggle_na?.("step-6")}
      />

      {/* PASO 7: Situación Actual */}
      <TimeSeriesYTD
        value={target_vs_actual}
        onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit}
        onUnitChange={on_target_vs_actual_unit_change}
        title={t("pdcaPlan.step7Title")}
        chartTitle={target_vs_actual_title}
        onTitleChange={on_target_vs_actual_title_change}
        yMin={target_vs_actual_ymin}
        onYMinChange={on_target_vs_actual_ymin_change}
        yMax={target_vs_actual_ymax}
        onYMaxChange={on_target_vs_actual_ymax_change}
        isStepCompleted={completed_steps.has("step-12")}
        onToggleStep={() => on_toggle_step("step-12")}
        isNa={na_steps?.has("step-12")}
        onToggleNa={() => on_toggle_na?.("step-12")}
      />
    </div>
  );
};
