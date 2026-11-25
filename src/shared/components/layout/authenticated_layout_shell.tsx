/**
 * @fileoverview Lazy-loaded authenticated application shell mounting PDCA/RDA contexts, sidebar, header, and mobile menu.
 */

import type { ReactNode } from "react";
import { PdcaProvider } from "@/shared/context/pdca_context";
import { RdaProvider } from "@/shared/context/rda_context";
import { LayoutHeader } from "./layout_header";
import { LayoutMobileMenu } from "./layout_mobile_menu";
import { build_layout_nav_items, compute_user_initials } from "./layout_nav_config";
import { LayoutSidebar } from "./layout_sidebar";
import type { UserContextData } from "./layout_types";
import { useLayoutState } from "./use_layout_state";

function AuthenticatedLayoutInner({ children }: { children: ReactNode }): ReactNode {
  const {
    current_user,
    current_path,
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
  } = useLayoutState();

  if (!current_user) {
    return null;
  }

  const nav_items = build_layout_nav_items(current_user.role);
  const user_initials = compute_user_initials(current_user.name);
  const user_context_data: UserContextData = current_user as unknown as UserContextData;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <LayoutSidebar
        desktopSidebarOpen={desktop_sidebar_open}
        navItems={nav_items}
        currentPath={current_path}
        currentUser={user_context_data}
        userInitials={user_initials}
        handleLogout={() => void handle_logout()}
      />

      <div className="flex flex-1 flex-col overflow-hidden">
        <LayoutHeader
          setMobileMenuOpen={set_mobile_menu_open}
          desktopSidebarOpen={desktop_sidebar_open}
          setDesktopSidebarOpen={set_desktop_sidebar_open}
          sidebarPinned={sidebar_pinned}
          onToggleSidebarPinned={toggle_sidebar_pinned}
          currentUser={user_context_data}
          userInitials={user_initials}
          userStats={user_stats}
          handleLogout={() => void handle_logout()}
          pendingDeadlinePdcas={pending_deadline_pdcas}
          pendingDeadlineRdas={pending_deadline_rdas}
          deadlinePickerOpenId={deadline_picker_open_id}
          setDeadlinePickerOpenId={set_deadline_picker_open_id}
          handleDeadlineChange={(pdca_id, selected_date, is_no_limit) =>
            void handle_pdca_deadline_change(pdca_id, selected_date, is_no_limit)
          }
          handleRdaDeadlineChange={(rda_id, selected_date, is_no_limit) =>
            void handle_rda_deadline_change(rda_id, selected_date, is_no_limit)
          }
        />

        <LayoutMobileMenu
          mobileMenuOpen={mobile_menu_open}
          setMobileMenuOpen={set_mobile_menu_open}
          navItems={nav_items}
          currentPath={current_path}
          handleLogout={() => void handle_logout()}
        />

        <main ref={main_element_ref} className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}

/**
 * Provides shared PDCA/RDA contexts and full authenticated navigation chrome around protected routes.
 * Loaded on demand only after a verified corporate user session is active.
 */
export function AuthenticatedLayoutShell({ children }: { children: ReactNode }): ReactNode {
  return (
    <PdcaProvider>
      <RdaProvider>
        <AuthenticatedLayoutInner>{children}</AuthenticatedLayoutInner>
      </RdaProvider>
    </PdcaProvider>
  );
}
