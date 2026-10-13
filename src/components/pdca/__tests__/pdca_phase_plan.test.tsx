/**
 * pdca_phase_plan.test.tsx
 * Pruebas unitarias de la Fase 1 (PLAN) del PDCA.
 */
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { PdcaPhasePlan } from "../1.PLAN/pdca_phase_plan";
import { DEFAULT_DEFINICION_META } from "@/components/pdca/1.PLAN/paso1/pdca-goal-definition";
import { DEFAULT_PARTICIPANTES, DEFAULT_VPO_CHECKPOINTS } from "@/data/pdca";

describe("PdcaPhasePlan", () => {
  it("debe renderizar la sección de meta y participantes", () => {
    render(
      <PdcaPhasePlan
        title_value=""
        on_title_change={vi.fn()}
        area_value=""
        on_area_change={vi.fn()}
        on_deadline_change={vi.fn()}
        problem_description="Descripción de prueba"
        on_problem_change={vi.fn()}
        goal_definition={DEFAULT_DEFINICION_META}
        on_goal_definition_change={vi.fn()}
        participants_info={DEFAULT_PARTICIPANTES}
        on_participants_info_change={vi.fn()}
        team_members_list={["Miembro A", "Miembro B"]}
        on_team_members_change={vi.fn()}
        vpo_checkpoints={DEFAULT_VPO_CHECKPOINTS}
        on_vpo_checkpoints_change={vi.fn()}
        completed_steps={new Set()}
        na_steps={new Set()}
        on_toggle_step={vi.fn()}
        is_editable={true}
        author_name=""
        author_email=""
        on_author_change={vi.fn()}
        assigned_users={[]}
        on_toggle_assigned_user={vi.fn()}
        available_users={[]}
        is_admin_user={false}
      />,
    );

    const subphase1Btn = screen.getByRole("button", { name: /Identificación del Problema/i });
    fireEvent.click(subphase1Btn);

    expect(screen.getByText(/PASO 1: DECLARACIÓN DEL PROYECTO/i)).toBeDefined();
    expect(screen.getByText(/PASO 2: FASE SDCA CHECKLIST/i)).toBeDefined();
  });
});
