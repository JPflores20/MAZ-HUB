/**
 * @fileoverview Custom hook managing layout sidebar pinning, scroll collapse, auth redirects, and deadline assignment.
 */

import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { DEFAULT_RDA } from "@/domain/models/rda";
import { useAuth } from "@/features/auth/auth_context";
import { usePdcas } from "@/shared/context/pdca_context";
import { useRdas } from "@/shared/context/rda_context";
import {
  compute_user_workload_stats,
  format_pdca_deadline_value,
  format_rda_deadline_value,
} from "./layout_deadline_helpers";
import { PUBLIC_AUTH_ROUTES } from "./layout_nav_config";
import type { UserWorkloadStats } from "./layout_types";

const SIDEBAR_PINNED_STORAGE_KEY = "maz_hub_sidebar_pinned";

function read_initial_sidebar_pinned(): boolean {
  try {
    const saved_flag = localStorage.getItem(SIDEBAR_PINNED_STORAGE_KEY);
    return saved_flag ? saved_flag === "true" : true;
  } catch {
    return true;
  }
}

/**
 * Encapsulates structural shell state: responsive drawers, scroll-collapse behavior,
 * missing-deadline admin actions, and workload statistics.
 */
export function useLayoutState() {
  const router_state = useRouterState();
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth();
  const current_path = router_state.location.pathname;

  const [mobile_menu_open, set_mobile_menu_open] = useState(false);
  const [desktop_sidebar_open, set_desktop_sidebar_open] = useState(true);
  const [sidebar_pinned, set_sidebar_pinned] = useState<boolean>(read_initial_sidebar_pinned);
  const [deadline_picker_open_id, set_deadline_picker_open_id] = useState<string | null>(null);
  const main_element_ref = useRef<HTMLElement>(null);

  const { allPdcas, pdcaList, updatePdcaInCache } = usePdcas();
  const { allRdas, rdaList, updateRdaInCache } = useRdas();

  const toggle_sidebar_pinned = () => {
    set_sidebar_pinned((previous_pinned) => {
      const next_pinned = !previous_pinned;
      try {
        localStorage.setItem(SIDEBAR_PINNED_STORAGE_KEY, String(next_pinned));
      } catch {
        // Storage access can be blocked in strict browser modes
      }
      if (next_pinned) {
        set_desktop_sidebar_open(true);
      }
      return next_pinned;
    });
  };

  useEffect(() => {
    if (sidebar_pinned) {
      return undefined;
    }
    let last_scroll_top = 0;
    const main_element = main_element_ref.current;

    const handle_scroll = (scroll_event: Event) => {
      const scroll_target = scroll_event.target as HTMLElement | Document | null;
      let current_scroll_top = main_element ? main_element.scrollTop : 0;

      if (scroll_target === document || scroll_target === document.documentElement) {
        current_scroll_top = window.scrollY || document.documentElement.scrollTop;
      } else if (scroll_target && "scrollTop" in scroll_target) {
        current_scroll_top = (scroll_target as HTMLElement).scrollTop;
      }

      if (current_scroll_top > 20 && current_scroll_top > last_scroll_top) {
        set_desktop_sidebar_open(false);
      } else if (current_scroll_top <= 10) {
        set_desktop_sidebar_open(true);
      }
      last_scroll_top = current_scroll_top;
    };

    main_element?.addEventListener("scroll", handle_scroll, { passive: true });
    window.addEventListener("scroll", handle_scroll, { passive: true });
    return () => {
      main_element?.removeEventListener("scroll", handle_scroll);
      window.removeEventListener("scroll", handle_scroll);
    };
  }, [sidebar_pinned]);

  useEffect(() => {
    if (main_element_ref.current) {
      main_element_ref.current.scrollTop = 0;
    }
    set_desktop_sidebar_open(true);
  }, [current_path]);

  const handle_pdca_deadline_change = async (
    pdca_id: string,
    selected_date: Date | undefined,
    is_no_limit = false,
  ) => {
    const formatted_deadline = format_pdca_deadline_value(selected_date, is_no_limit);
    const { update_pdca_deadline } = await import(
      "@/shared/services/pdca/pdca_firestore_mutations"
    );
    await update_pdca_deadline(pdca_id, formatted_deadline || null);
    const existing_pdca = allPdcas.find((pdca_entry) => pdca_entry.id === pdca_id);
    if (existing_pdca) {
      updatePdcaInCache({ ...existing_pdca, fechaFinalizacion: formatted_deadline });
    }
    set_deadline_picker_open_id(null);
  };

  const handle_rda_deadline_change = async (
    rda_id: string,
    selected_date: Date | undefined,
    is_no_limit = false,
  ) => {
    const existing_rda = allRdas.find((rda_entry) => rda_entry.id === rda_id);
    if (!existing_rda) {
      return;
    }
    const serialized_deadline = format_rda_deadline_value(selected_date, is_no_limit);
    const { update_rda } = await import("@/shared/services/rda/rda_firestore_mutations");
    const saved_rda = await update_rda({
      ...existing_rda,
      portada: {
        ...(existing_rda.portada || DEFAULT_RDA.portada!),
        fechaLimite: serialized_deadline,
      },
    });
    updateRdaInCache(saved_rda);
    set_deadline_picker_open_id(null);
  };

  const pending_deadline_pdcas = useMemo(() => {
    if (currentUser?.role !== "admin") {
      return [];
    }
    return allPdcas.filter(
      (pdca_entry) => !pdca_entry.fechaFinalizacion || pdca_entry.fechaFinalizacion.trim() === "",
    );
  }, [allPdcas, currentUser?.role]);

  const pending_deadline_rdas = useMemo(() => {
    if (currentUser?.role !== "admin") {
      return [];
    }
    return allRdas.filter(
      (rda_entry) => !rda_entry.portada?.fechaLimite || rda_entry.portada.fechaLimite.trim() === "",
    );
  }, [allRdas, currentUser?.role]);

  const user_stats = useMemo<UserWorkloadStats>(
    () => compute_user_workload_stats(pdcaList, rdaList),
    [pdcaList, rdaList],
  );

  const is_public_route = PUBLIC_AUTH_ROUTES.includes(current_path);

  useEffect(() => {
    if (!loading && !currentUser && !is_public_route) {
      void navigate({ to: "/login" });
    }
  }, [loading, currentUser, is_public_route, navigate]);

  const handle_logout = async () => {
    await logout();
    void navigate({ to: "/login" });
  };

  return {
    current_user: currentUser,
    loading,
    current_path,
    is_public_route,
    main_element_ref,
    mobile_menu_open,
    set_mobile_menu_open,
    desktop_sidebar_open,
    set_desktop_sidebar_open,
    sidebar_pinned,
    toggle_sidebar_pinned,
    deadline_picker_open_id,
    set_deadline_picker_open_id,
    pending_deadline_pdcas,
    pending_deadline_rdas,
    user_stats,
    handle_pdca_deadline_change,
    handle_rda_deadline_change,
    handle_logout,
  };
}
