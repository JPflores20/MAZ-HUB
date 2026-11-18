/**
 * @fileoverview Top application navigation header with sidebar controls, command search, notifications, deadlines, and profile menu.
 */

import type React from "react";
import { Menu, Pin, PinOff } from "lucide-react";
import { NotificationBell } from "@/features/notifications";
import type { Rda } from "@/domain/models/rda";
import type { Pdca } from "@/domain/pdca";
import { ThemeToggle } from "@/shared/components/theme_toggle";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/utils/class_names";
import { GlobalSearchDialog } from "./global_search_dialog";
import { LayoutDeadlinesPopover } from "./layout_deadlines_popover";
import { LayoutProfilePopover } from "./layout_profile_popover";
import type { UserContextData, UserWorkloadStats } from "./layout_types";

/** Props accepted by LayoutHeader. */
export interface LayoutHeaderProps {
  setMobileMenuOpen: (open: boolean) => void;
  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
  sidebarPinned?: boolean | undefined;
  onToggleSidebarPinned?: (() => void) | undefined;
  currentUser: UserContextData;
  userInitials: string;
  userStats?: UserWorkloadStats | undefined;
  handleLogout?: (() => void) | undefined;
  pendingDeadlinePdcas: Pdca[];
  pendingDeadlineRdas?: Rda[] | undefined;
  deadlinePickerOpenId: string | null;
  setDeadlinePickerOpenId: (id: string | null) => void;
  handleDeadlineChange: (id: string, date: Date | undefined, isNoLimit?: boolean) => void;
  handleRdaDeadlineChange?:
    | ((id: string, date: Date | undefined, isNoLimit?: boolean) => void)
    | undefined;
}

/**
 * Top sticky bar coordinating responsive menu triggers, Ctrl+K search, alerts, and user profile menu.
 *
 * @param {LayoutHeaderProps} props - Header state callbacks and user/deadline collections.
 * @returns {React.ReactElement} Styled application `<header>` element.
 */
export const LayoutHeader: React.FC<LayoutHeaderProps> = ({
  setMobileMenuOpen,
  desktopSidebarOpen,
  setDesktopSidebarOpen,
  sidebarPinned = true,
  onToggleSidebarPinned,
  currentUser,
  userInitials,
  userStats,
  handleLogout,
  pendingDeadlinePdcas,
  pendingDeadlineRdas = [],
  deadlinePickerOpenId,
  setDeadlinePickerOpenId,
  handleDeadlineChange,
  handleRdaDeadlineChange,
}) => (
  <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] text-white px-4 md:px-8 shadow-md relative z-0 print:hidden">
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setMobileMenuOpen(true)}
        className="text-white hover:bg-white/10 md:hidden"
      >
        <Menu className="size-5" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setDesktopSidebarOpen(!desktopSidebarOpen)}
        className="text-white hover:bg-white/10 hidden md:flex"
        title={desktopSidebarOpen ? "Contraer barra lateral" : "Expandir barra lateral"}
      >
        <Menu className="size-5" />
      </Button>

      {onToggleSidebarPinned && (
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggleSidebarPinned}
          className={cn(
            "hidden md:flex h-8 w-8",
            sidebarPinned
              ? "text-amber-300 hover:bg-white/10 hover:text-amber-200"
              : "text-blue-200/60 hover:bg-white/10 hover:text-white",
          )}
          title={
            sidebarPinned
              ? "Barra lateral fija (clic para auto-ocultar al hacer scroll)"
              : "Barra lateral auto-ocultable (clic para fijar)"
          }
        >
          {sidebarPinned ? <Pin className="size-4" /> : <PinOff className="size-4" />}
        </Button>
      )}

      <div
        className={cn(
          "flex items-center gap-3",
          desktopSidebarOpen ? "md:hidden" : "hidden md:flex lg:flex",
        )}
      >
        <img
          src="/logos/MAZ.webp"
          alt="Logo MAZ"
          className={cn(
            "h-7 w-auto object-contain rounded",
            desktopSidebarOpen ? "md:hidden" : "",
          )}
        />
        {!desktopSidebarOpen && (
          <span className="font-display font-bold uppercase tracking-wider hidden md:block">
            MAZ HUB
          </span>
        )}
      </div>

      <div className="ml-1">
        <GlobalSearchDialog />
      </div>
    </div>

    <div className="flex items-center gap-2.5">
      <ThemeToggle className="text-blue-200/80 hover:bg-white/10 hover:text-white" />

      <NotificationBell />

      <LayoutDeadlinesPopover
        isAdmin={currentUser.role === "admin"}
        pendingDeadlinePdcas={pendingDeadlinePdcas}
        pendingDeadlineRdas={pendingDeadlineRdas}
        deadlinePickerOpenId={deadlinePickerOpenId}
        setDeadlinePickerOpenId={setDeadlinePickerOpenId}
        handleDeadlineChange={handleDeadlineChange}
        handleRdaDeadlineChange={handleRdaDeadlineChange}
      />

      <LayoutProfilePopover
        currentUser={currentUser}
        userInitials={userInitials}
        userStats={userStats}
        sidebarPinned={sidebarPinned}
        onToggleSidebarPinned={onToggleSidebarPinned}
        handleLogout={handleLogout}
      />
    </div>
  </header>
);
