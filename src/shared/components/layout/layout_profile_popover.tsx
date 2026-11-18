/**
 * @fileoverview Header user profile popover displaying workload stats, sidebar pin toggle, and session actions.
 */

import type React from "react";
import { Link } from "@tanstack/react-router";
import {
  ClipboardList,
  ListChecks,
  LogOut,
  Pin,
  PinOff,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import type { UserContextData, UserWorkloadStats } from "./layout_types";

interface LayoutProfilePopoverProps {
  currentUser: UserContextData;
  userInitials: string;
  userStats?: UserWorkloadStats | undefined;
  sidebarPinned: boolean;
  onToggleSidebarPinned?: (() => void) | undefined;
  handleLogout?: (() => void) | undefined;
}

/**
 * Renders the top-right profile trigger button and quick-action dropdown popover.
 *
 * @param {LayoutProfilePopoverProps} props - Signed-in user details, stats, sidebar toggle, and logout callback.
 * @returns {React.ReactElement} User profile menu popover.
 */
export const LayoutProfilePopover: React.FC<LayoutProfilePopoverProps> = ({
  currentUser,
  userInitials,
  userStats,
  sidebarPinned,
  onToggleSidebarPinned,
  handleLogout,
}) => (
  <Popover>
    <PopoverTrigger asChild>
      <button
        type="button"
        title="Mi perfil y resumen de actividad"
        className="flex items-center gap-3 border-l border-white/15 pl-4 py-1.5 px-2.5 rounded-xl hover:bg-white/10 transition-colors group cursor-pointer text-left"
      >
        <div className="text-right hidden sm:block">
          <p className="text-sm font-semibold text-white leading-none group-hover:text-blue-200 transition-colors">
            {currentUser.name}
          </p>
          <p className="mt-1 text-xs text-blue-300 font-medium">
            {currentUser.position ? `${currentUser.position} · ${currentUser.area}` : currentUser.area}
          </p>
        </div>
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="size-9 rounded-full object-cover shadow-md ring-2 ring-blue-500/30 group-hover:ring-blue-400 transition-all"
          />
        ) : (
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-md ring-2 ring-blue-500/30 group-hover:ring-blue-400 transition-all">
            {userInitials}
          </div>
        )}
      </button>
    </PopoverTrigger>
    <PopoverContent align="end" className="w-72 p-0 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4 border-b border-border bg-secondary/30">
        <div className="flex items-center gap-3">
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="size-11 rounded-full object-cover ring-2 ring-primary/30"
            />
          ) : (
            <div className="flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
              {userInitials}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-foreground truncate">{currentUser.name}</p>
            <p className="text-xs text-muted-foreground truncate">
              {currentUser.position || "Integrante"} • {currentUser.area}
            </p>
            <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
              {currentUser.role === "admin" ? "Administrador" : "Usuario"}
            </span>
          </div>
        </div>

        {userStats && (
          <div className="mt-3 grid grid-cols-3 gap-1.5 text-center">
            <div className="rounded-lg border border-border bg-background p-1.5">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400">
                <ClipboardList className="size-3" /> {userStats.activePdcas}
              </div>
              <p className="text-[10px] text-muted-foreground">PDCAs</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-1.5">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-purple-600 dark:text-purple-400">
                <ShieldAlert className="size-3" /> {userStats.activeRdas}
              </div>
              <p className="text-[10px] text-muted-foreground">RDAs</p>
            </div>
            <div className="rounded-lg border border-border bg-background p-1.5">
              <div className="flex items-center justify-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400">
                <ListChecks className="size-3" /> {userStats.pendingActions}
              </div>
              <p className="text-[10px] text-muted-foreground">Acciones</p>
            </div>
          </div>
        )}
      </div>

      <div className="p-2 space-y-1">
        {onToggleSidebarPinned && (
          <button
            type="button"
            onClick={onToggleSidebarPinned}
            className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              {sidebarPinned ? (
                <Pin className="size-4 text-primary" />
              ) : (
                <PinOff className="size-4 text-muted-foreground" />
              )}
              Fijar menú lateral al bajar
            </span>
            <span className="text-[10px] font-bold uppercase text-primary">
              {sidebarPinned ? "Fijo" : "Auto"}
            </span>
          </button>
        )}

        <Link
          to="/configuracion"
          className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <Settings className="size-4 text-muted-foreground" />
          Mi Perfil y Configuración
        </Link>

        {currentUser.role === "admin" && (
          <Link
            to="/admin"
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-foreground hover:bg-secondary transition-colors"
          >
            <Users className="size-4 text-muted-foreground" />
            Gestión de Usuarios (Admin)
          </Link>
        )}

        {handleLogout && (
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        )}
      </div>
    </PopoverContent>
  </Popover>
);
