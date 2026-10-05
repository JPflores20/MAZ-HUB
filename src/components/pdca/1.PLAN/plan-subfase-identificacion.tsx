import { StepCard } from "@/components/ui/step-card";
import { StepInstructions } from "../step-instructions";
import { PdcaGoalDefinition } from "@/components/pdca/1.PLAN/paso1/pdca-goal-definition";
import { PdcaParticipants } from "@/components/pdca/1.PLAN/paso1/pdca-participants";
import { VpoCheckpointTable } from "./paso2/vpo-checkpoint-table";
import { TimeSeriesYTD } from "./paso7/time-series-ytd";
import { MultiImageUploadSection, ALL_ACCEPT_STRING } from "../image-upload-section";
import { VozConsumidorTable } from "./paso5/voz-consumidor-table";
import { AnalisisRiesgosTable } from "./paso6/analisis-riesgos-table";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { DatePicker } from "@/components/ui/date-picker";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { AREAS } from "@/data/pdca";
import type { PropiedadesFasePlan } from "./plan-props";
import { EditorTextoEnriquecido } from "./plan-rich-text-editor";

type PropiedadesSubfaseIdentificacion = Pick<PropiedadesFasePlan,
  | "title_value" | "on_title_change"
  | "area_value" | "on_area_change"
  | "deadline_date" | "on_deadline_change"
  | "author_name" | "author_email" | "on_author_change"
  | "assigned_users" | "on_toggle_assigned_user" | "available_users"
  | "is_admin_user" | "is_editable"
  | "problem_description" | "on_problem_change"
  | "goal_definition" | "on_goal_definition_change"
  | "participants_info" | "on_participants_info_change"
  | "vpo_checkpoints" | "on_vpo_checkpoints_change"
  | "completed_steps" | "na_steps" | "on_toggle_step" | "on_toggle_na"
  | "sipoc_map_files" | "on_sipoc_map_files_change"
  | "process_mapping_files" | "on_process_mapping_files_change"
  | "voz_consumidor" | "on_voz_consumidor_change"
  | "analisis_riesgos_proyecto" | "on_analisis_riesgos_proyecto_change"
  | "target_vs_actual" | "on_target_vs_actual_change"
  | "target_vs_actual_unit" | "on_target_vs_actual_unit_change"
  | "target_vs_actual_title" | "on_target_vs_actual_title_change"
  | "target_vs_actual_ymin" | "on_target_vs_actual_ymin_change"
  | "target_vs_actual_ymax" | "on_target_vs_actual_ymax_change"
>;

/** Subfase 1: Identificación del Problema (Pasos 1-7) */
export function SubfaseIdentificacionProblema(props: PropiedadesSubfaseIdentificacion) {
  const {
    title_value, on_title_change, area_value, on_area_change,
    deadline_date, on_deadline_change, author_name, author_email, on_author_change,
    assigned_users, on_toggle_assigned_user, available_users, is_admin_user, is_editable,
    problem_description, on_problem_change, goal_definition, on_goal_definition_change,
    participants_info, on_participants_info_change, vpo_checkpoints, on_vpo_checkpoints_change,
    completed_steps, na_steps, on_toggle_step, on_toggle_na,
    sipoc_map_files, on_sipoc_map_files_change, process_mapping_files, on_process_mapping_files_change,
    voz_consumidor, on_voz_consumidor_change, analisis_riesgos_proyecto, on_analisis_riesgos_proyecto_change,
    target_vs_actual, on_target_vs_actual_change, target_vs_actual_unit, on_target_vs_actual_unit_change,
    target_vs_actual_title, on_target_vs_actual_title_change, target_vs_actual_ymin,
    on_target_vs_actual_ymin_change, target_vs_actual_ymax, on_target_vs_actual_ymax_change,
  } = props;

  return (
    <>
      {/* PASO 1: DECLARACIÓN DEL PROYECTO */}
      <StepCard title="PASO 1: DECLARACIÓN DEL PROYECTO"
        isStepCompleted={completed_steps.has("step-1")} onToggleStep={() => on_toggle_step("step-1")}
        isNa={na_steps?.has("step-1")} onToggleNa={() => on_toggle_na?.("step-1")}>
        <StepInstructions>
          <p>Define el alcance del problema, el equipo responsable y los datos de contexto del PDCA.</p>
        </StepInstructions>
        <div className="space-y-5 mt-4">
          {/* Fila: Título, Área, Fecha Límite, Autor */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-1.5 lg:col-span-1">
              <Label className="text-xs font-semibold">TÍTULO DEL PROYECTO</Label>
              <Input value={title_value} onChange={(e) => on_title_change(e.target.value)}
                disabled={!is_editable} placeholder="Ej: Reducción de mermas en cocimientos" className="h-9 text-xs" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">ÁREA</Label>
              <Select value={area_value} onValueChange={on_area_change} disabled={!is_editable}>
                <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Seleccionar área" /></SelectTrigger>
                <SelectContent>
                  {AREAS.map((a) => (<SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">FECHA LÍMITE</Label>
              <DatePicker date={deadline_date} setDate={on_deadline_change}
                placeholder="Seleccionar fecha límite" disabled={!is_admin_user} className="h-9 text-xs w-full" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">AUTOR ORIGINAL</Label>
              {is_admin_user ? (
                <Select value={author_email} onValueChange={(email) => {
                  const encontrado = available_users.find((u) => u.email === email);
                  on_author_change(email, encontrado?.name || "Usuario");
                }}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Seleccionar autor" /></SelectTrigger>
                  <SelectContent>
                    {(available_users ?? []).map((u) => (<SelectItem key={u.email} value={u.email}>{u.name}</SelectItem>))}
                  </SelectContent>
                </Select>
              ) : (
                <Input value={author_name} disabled className="h-9 text-xs" />
              )}
            </div>
          </div>

          {/* Usuarios Asignados */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">USUARIOS ASIGNADOS (CO-RESPONSABLES)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start text-left font-normal min-h-[36px] h-auto p-2">
                  {(assigned_users ?? []).length === 0 ? (
                    <span className="text-xs text-muted-foreground">Seleccionar usuarios...</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {(assigned_users ?? []).map((u) => (
                        <Badge key={u.email} variant="secondary" className="text-[11px] py-0">{u.name}</Badge>
                      ))}
                    </div>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 p-2" align="start">
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {(available_users ?? []).map((u) => {
                    const estaAsignado = (assigned_users ?? []).some((a) => a.email === u.email);
                    return (
                      <div key={u.email} onClick={() => on_toggle_assigned_user(u)}
                        className="flex items-center justify-between p-1.5 rounded hover:bg-muted cursor-pointer text-xs">
                        <span>{u.name}</span>
                        {estaAsignado && <Badge variant="outline" className="text-[10px]">Asignado</Badge>}
                      </div>
                    );
                  })}
                </div>
              </PopoverContent>
            </Popover>
          </div>

          {/* Descripción del Problema */}
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">DESCRIPCIÓN DEL PROBLEMA</Label>
            <EditorTextoEnriquecido value={problem_description} onChange={on_problem_change} disabled={!is_editable} />
          </div>

          {/* Definición de la Meta */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">DEFINICIÓN DE LA META (VPO STANDARD)</Label>
              <span className="text-[10px] text-muted-foreground flex items-center gap-1">⏱ Formato oficial A3 / A8 InBev</span>
            </div>
            <PdcaGoalDefinition value={goal_definition} onChange={on_goal_definition_change} readOnly={!is_editable} />
          </div>

          {/* Participantes */}
          <div className="space-y-1.5">
            <PdcaParticipants value={participants_info} onChange={on_participants_info_change} readOnly={!is_editable} />
          </div>
        </div>
      </StepCard>

      {/* PASO 2: VPO */}
      <VpoCheckpointTable checkpoints={vpo_checkpoints} onChange={on_vpo_checkpoints_change}
        problemaTexto={problem_description} completedSteps={completed_steps}
        naSteps={na_steps ?? new Set()}
        onToggleStep={on_toggle_step} onToggleNa={on_toggle_na} />

      {/* PASO 3: SIPOC MAP */}
      <MultiImageUploadSection images={sipoc_map_files || []} onChange={(f) => on_sipoc_map_files_change?.(f)}
        title="PASO 3: SIPOC MAP" subtitle="Sube tus imágenes o PDFs"
        description="Adjunta fotos o documentos del SIPOC MAP (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint."
        maxImages={6} acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-3")} onToggleStep={() => on_toggle_step("step-3")}
        isNa={na_steps?.has("step-3")} onToggleNa={() => on_toggle_na?.("step-3")} />

      {/* PASO 4: MAPEO DE PROCESOS */}
      <MultiImageUploadSection images={process_mapping_files || []} onChange={(f) => on_process_mapping_files_change?.(f)}
        title="PASO 4: MAPEO DE PROCESOS" subtitle="Sube tus imágenes o PDFs"
        description="Adjunta fotos o documentos (máximo 6 archivos). Se aceptan imágenes, PDF, Excel y PowerPoint."
        maxImages={6} acceptTypes={ALL_ACCEPT_STRING}
        isStepCompleted={completed_steps.has("step-4")} onToggleStep={() => on_toggle_step("step-4")}
        isNa={na_steps?.has("step-4")} onToggleNa={() => on_toggle_na?.("step-4")} />

      {/* PASO 5: VOZ DEL CONSUMIDOR */}
      <VozConsumidorTable items={voz_consumidor || []} onChange={on_voz_consumidor_change!}
        isStepCompleted={completed_steps.has("step-5")} onToggleStep={() => on_toggle_step("step-5")}
        isNa={na_steps?.has("step-5")} onToggleNa={() => on_toggle_na?.("step-5")} />

      {/* PASO 6: ANÁLISIS DE RIESGOS */}
      <AnalisisRiesgosTable title="PASO 6: ANÁLISIS DE RIESGOS DEL PROYECTO"
        items={analisis_riesgos_proyecto || []} onChange={on_analisis_riesgos_proyecto_change!}
        isStepCompleted={completed_steps.has("step-6")} onToggleStep={() => on_toggle_step("step-6")}
        isNa={na_steps?.has("step-6")} onToggleNa={() => on_toggle_na?.("step-6")} />

      {/* PASO 7: SITUACIÓN ACTUAL */}
      <TimeSeriesYTD value={target_vs_actual ?? []} onChange={on_target_vs_actual_change}
        unit={target_vs_actual_unit} onUnitChange={on_target_vs_actual_unit_change}
        title="PASO 7: SITUACIÓN ACTUAL" chartTitle={target_vs_actual_title}
        onTitleChange={on_target_vs_actual_title_change} yMin={target_vs_actual_ymin}
        onYMinChange={on_target_vs_actual_ymin_change} yMax={target_vs_actual_ymax}
        onYMaxChange={on_target_vs_actual_ymax_change}
        isStepCompleted={completed_steps.has("step-12")} onToggleStep={() => on_toggle_step("step-12")}
        isNa={na_steps?.has("step-12")} onToggleNa={() => on_toggle_na?.("step-12")} />
    </>
  );
}
