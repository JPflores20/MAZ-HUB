import React from "react";
import { useTranslation } from "react-i18next";
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
                    const found = available_users.find((u) => u.email === email);
                    on_author_change(email, found?.name || "Usuario");
                  }}
                >
                  <SelectTrigger className="h-9 text-xs">
                    <SelectValue placeholder={t("pdcaPlan.selectAuthor")} />
                  </SelectTrigger>
                  <SelectContent>
                    {(available_users ?? []).map((u) => (
                      <SelectItem key={u.email} value={u.email}>
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

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t("pdcaPlan.assignedUsers")}</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal min-h-[36px] h-auto p-2"
                >
                  {(assigned_users ?? []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">
                      {t("pdcaPlan.selectUsers")}
                    </span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(assigned_users ?? []).map((u) => (
                        <Badge key={u.email} variant="secondary" className="text-[11px] py-0">
                          {u.name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2" align="start">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {(available_users ?? []).map((u) => {
                    const assigned = (assigned_users ?? []).some((a) => a.email === u.email);
                    return (
                      <div
                        key={u.email}
                        onClick={() => on_toggle_assigned_user(u)}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                      >
                        <span>{u.name}</span>
                        {assigned && (
                          <Badge variant="outline" className="text-[10px]">
                            {t("pdcaPlan.assigned")}
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
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
