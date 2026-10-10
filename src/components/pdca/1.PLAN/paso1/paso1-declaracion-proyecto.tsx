import React from "react";
import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../../step-instructions";
import { PdcaGoalDefinition } from "./pdca-goal-definition";
import { PdcaParticipants } from "./pdca-participants";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AREAS } from "@/data/pdca";
import { EditorTextoEnriquecido } from "../plan-rich-text-editor";
import type { PropiedadesFasePlan } from "../plan-props";
import { useTranslation } from "react-i18next";

export type PropiedadesPaso1Declaracion = Pick<
  PropiedadesFasePlan,
  | "title_value"
  | "on_title_change"
  | "area_value"
  | "on_area_change"
  | "deadline_date"
  | "on_deadline_change"
  | "author_name"
  | "author_email"
  | "on_author_change"
  | "assigned_users"
  | "on_toggle_assigned_user"
  | "available_users"
  | "is_admin_user"
  | "is_editable"
  | "problem_description"
  | "on_problem_change"
  | "goal_definition"
  | "on_goal_definition_change"
  | "participants_info"
  | "on_participants_info_change"
  | "completed_steps"
  | "na_steps"
  | "on_toggle_step"
  | "on_toggle_na"
>;

/** Componente modular para el Paso 1: Declaración del Proyecto */
export const Paso1DeclaracionProyecto: React.FC<PropiedadesPaso1Declaracion> = ({
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
  is_editable,
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
}) => {
    const { t } = useTranslation();
  return (
    <StepCard
      title={t('pdcaPlan.dynamic.paso1DeclaraciNDel')}
      isStepCompleted={completed_steps.has("step-1")}
      onToggleStep={() => on_toggle_step("step-1")}
      isNa={na_steps?.has("step-1")}
      onToggleNa={() => on_toggle_na?.("step-1")}
    >
      <StepInstructions>
        <p>
          {t('pdcaPlan.dynamic.defineElAlcanceDelProblema')}</p>
      </StepInstructions>

      <div className="space-y-5 mt-4">
        {/* Metadatos principales: Título, Área, Fecha Límite, Autor */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5 lg:col-span-1">
            <Label className="text-xs font-semibold">{t('pdcaPlan.dynamic.tTuloDelProyecto')}</Label>
            <Input
              value={title_value}
              onChange={(e) => on_title_change(e.target.value)}
              disabled={!is_editable}
              placeholder={t('pdcaPlan.dynamic.ejReducciNDeMermas')}
              className="h-9 text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('pdcaPlan.dynamic.rea')}</Label>
            <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder={t('pdcaPlan.dynamic.seleccionarRea')} />
              </SelectTrigger>
              <SelectContent>
                {AREAS.map((area) => (
                  <SelectItem key={area.value} value={area.value}>
                    {area.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('pdcaPlan.dynamic.fechaLMite')}</Label>
            <DatePicker
              date={deadline_date}
              setDate={(d) => on_deadline_change?.(d)}
              placeholder={t('pdcaPlan.dynamic.seleccionarFechaLMite')}
              disabled={!is_admin_user}
              className="h-9 text-xs w-full"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">{t('pdcaPlan.dynamic.autorOriginal')}</Label>
            {is_admin_user ? (
              <Select
                value={author_email}
                onValueChange={(email) => {
                  const usuarioEncontrado = (available_users ?? []).find((u) => u.email === email);
                  on_author_change(email, usuarioEncontrado?.name || "Usuario");
                }}
              >
                <SelectTrigger className="h-9 text-xs">
                  <SelectValue placeholder={t('pdcaPlan.dynamic.seleccionarAutor')} />
                </SelectTrigger>
                <SelectContent>
                  {(available_users ?? []).map((usuario) => (
                    <SelectItem key={usuario.email} value={usuario.email}>
                      {usuario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input value={author_name} disabled className="h-9 text-xs" />
            )}
          </div>
        </div>

        {/* Usuarios Asignados */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{t('pdcaPlan.dynamic.usuariosAsignadosCoResponsables')}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal min-h-[36px] h-auto p-2"
              >
                {(assigned_users ?? []).length === 0 ? (
                  <span className="text-xs text-muted-foreground">{t('pdcaPlan.dynamic.seleccionarUsuarios')}</span>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {(assigned_users ?? []).map((usuario) => (
                      <Badge key={usuario.email} variant="secondary" className="text-[11px] py-0">
                        {usuario.name}
                      </Badge>
                    ))}
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-72 p-2" align="start">
              <div className="max-h-60 overflow-y-auto space-y-1">
                {(available_users ?? []).map((usuario) => {
                  const estaAsignado = (assigned_users ?? []).some((a) => a.email === usuario.email);
                  return (
                    <div
                      key={usuario.email}
                      onClick={() => on_toggle_assigned_user(usuario)}
                      className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs"
                    >
                      <span>{usuario.name}</span>
                      {estaAsignado && (
                        <Badge variant="outline" className="text-[10px]">
                          {t('pdcaPlan.dynamic.asignado')}</Badge>
                      )}
                    </div>
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Descripción del Problema */}
        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">{t('pdcaPlan.dynamic.descripciNDelProblema')}</Label>
          <EditorTextoEnriquecido
            value={problem_description}
            onChange={on_problem_change}
            disabled={!is_editable}
          />
        </div>

        {/* Definición de la Meta */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">{t('pdcaPlan.dynamic.definiciNDeLaMeta')}</Label>
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              {t('pdcaPlan.dynamic.formatoOficialA3A8Inbev')}</span>
          </div>
          <PdcaGoalDefinition
            value={goal_definition}
            onChange={on_goal_definition_change}
            readOnly={!is_editable}
          />
        </div>

        {/* Participantes */}
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
