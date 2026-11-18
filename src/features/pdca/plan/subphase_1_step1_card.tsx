/**
 * @fileoverview Tarjeta del Paso 1 (Declaración del Problema, Meta, Asignados y Participantes).
 */
import React from "react";
import { useTranslation } from "react-i18next";
import { Label } from "@/shared/ui/label";
import { StepCard } from "@/shared/ui/step_card";
import { StepInstructions } from "../components/step_instructions";
import { PdcaGoalDefinition } from "./paso_1/pdca_goal_definition";
import { PdcaParticipants } from "./paso_1/pdca_participants";
import { RichTextEditor } from "./rich_text_editor";
import { Subphase1ProjectHeader } from "./subphase_1_project_header";
import { Subphase1AssignedUsers } from "./subphase_1_assigned_users";
import type { PhasePlanProps } from "./phase_plan_types";

/**
 * Renderiza el StepCard completo del Paso 1 con encabezado, equipo, descripción rica y definición de meta.
 */
export const Subphase1Step1Card: React.FC<PhasePlanProps> = (props) => {
  const { t: translate } = useTranslation();
  const {
    assigned_users,
    available_users,
    on_toggle_assigned_user,
    problem_description,
    on_problem_change,
    goal_definition,
    on_goal_definition_change,
    participants_info,
    on_participants_info_change,
    completed_steps,
    na_steps,
    on_toggle_step,
    on_toggle_na,
    is_editable,
  } = props;

  return (
    <StepCard
      title={translate("pdcaPlan.step1Title")}
      isStepCompleted={completed_steps.has("step-1")}
      onToggleStep={() => on_toggle_step("step-1")}
      isNa={na_steps?.has("step-1")}
      onToggleNa={() => on_toggle_na?.("step-1")}
    >
      <StepInstructions>
        <p>{translate("pdcaPlan.step1Desc")}</p>
      </StepInstructions>

      <div className="space-y-5 mt-4">
        <Subphase1ProjectHeader
          title_value={props.title_value}
          on_title_change={props.on_title_change}
          planta_value={props.planta_value}
          on_planta_change={props.on_planta_change}
          departamento_value={props.departamento_value}
          on_departamento_change={props.on_departamento_change}
          area_value={props.area_value}
          on_area_change={props.on_area_change}
          etapa_value={props.etapa_value}
          on_etapa_change={props.on_etapa_change}
          deadline_date={props.deadline_date}
          on_deadline_change={props.on_deadline_change}
          author_name={props.author_name}
          author_email={props.author_email}
          on_author_change={props.on_author_change}
          available_users={available_users}
          is_admin_user={props.is_admin_user}
          is_editable={is_editable}
        />

        <Subphase1AssignedUsers
          assigned_users={assigned_users ?? []}
          available_users={available_users ?? []}
          is_editable={is_editable}
          on_toggle_assigned_user={on_toggle_assigned_user}
        />

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">
            {translate("pdcaPlan.problemDescription")}
          </Label>
          <RichTextEditor
            value={problem_description}
            onChange={on_problem_change}
            disabled={!is_editable}
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">
              {translate("pdcaPlan.goalDefinition")}
            </Label>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {translate("pdcaPlan.formatInbev")}
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
  );
};
