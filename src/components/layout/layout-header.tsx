/**
 * layout-header.tsx
 * Barra superior de navegación con buscador global (Ctrl+K), control de fijado de sidebar,
 * campana de notificaciones, alertas de fechas límite (PDCA + RDA) y menú rápido de perfil de usuario.
 */
import React from "react";
import { Link } from "@tanstack/react-router";
import {
  Menu,
  CheckCircle2,
  Calendar,
  ArrowRight,
  CalendarClock,
  Pin,
  PinOff,
  Settings,
  Users,
  LogOut,
  ClipboardList,
  ShieldAlert,
  ListChecks,
} from "lucide-react";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { GlobalSearchDialog } from "./global-search-dialog";
import { getRdaDisplayName } from "@/components/RDA/rda-name";
import { cn } from "@/lib/utils";
import type { UserContextData } from "./layout-types";

interface Props {
  setMobileMenuOpen: (open: boolean) => void;
  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
  sidebarPinned?: boolean | undefined;
  onToggleSidebarPinned?: (() => void) | undefined;
  currentUser: UserContextData;
  userInitials: string;
  userStats?: { activePdcas: number; activeRdas: number; pendingActions: number } | undefined;
  handleLogout?: (() => void) | undefined;
  pendingDeadlinePdcas: any[];
  pendingDeadlineRdas?: any[] | undefined;
  deadlinePickerOpenId: string | null;
  setDeadlinePickerOpenId: (id: string | null) => void;
  handleDeadlineChange: (id: string, date: Date | undefined, isNoLimit?: boolean) => void;
  handleRdaDeadlineChange?: ((id: string, date: Date | undefined, isNoLimit?: boolean) => void) | undefined;
}

export const LayoutHeader: React.FC<Props> = ({
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
}) => {
  const totalMissingDeadlines = pendingDeadlinePdcas.length + pendingDeadlineRdas.length;

  return (
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

        {/* Buscador Global Instantáneo Ctrl+K */}
        <div className="ml-1">
          <GlobalSearchDialog />
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        <ThemeToggle className="text-blue-200/80 hover:bg-white/10 hover:text-white" />

        <NotificationBell />

        {/* Alerta unificada de Proyectos (PDCA + RDA) sin Fecha Límite */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-blue-200/80 hover:bg-white/10 hover:text-white"
              title="Proyectos sin fecha límite"
            >
              <CalendarClock className="size-5" />
              {currentUser.role === "admin" && totalMissingDeadlines > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 dark:bg-red-600 px-1 text-[11px] font-bold text-white shadow-md">
                  {totalMissingDeadlines}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 sm:w-[400px] p-0 border border-border bg-background text-foreground shadow-2xl rounded-2xl overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <CalendarClock className="size-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground leading-none">
                    Fechas Límite (PDCA & RDA)
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Panel de administración
                  </p>
                </div>
              </div>
              {currentUser.role === "admin" && totalMissingDeadlines > 0 && (
                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-1 rounded-full font-semibold border border-red-200 dark:border-red-800">
                  {totalMissingDeadlines} sin fecha
                </span>
              )}
            </div>

            <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
              {currentUser.role === "admin" ? (
                totalMissingDeadlines > 0 ? (
                  <>
                    {pendingDeadlinePdcas.map((p) => (
                      <Popover
                        key={`pdca-${p.id}`}
                        open={deadlinePickerOpenId === `pdca-${p.id}`}
                        onOpenChange={(open) =>
                          setDeadlinePickerOpenId(open ? `pdca-${p.id}` : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/70 border border-transparent hover:border-border transition-all group cursor-pointer">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30 mt-0.5">
                              <Calendar className="size-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0">
                                  PDCA
                                </Badge>
                                <p className="text-sm font-semibold text-foreground truncate leading-snug">
                                  {p.titulo || "Sin título"}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {p.autor || "Usuario"} ·{" "}
                                <span className="text-foreground/60">{p.area}</span>
                              </p>
                              <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <span>Asignar fecha límite</span>
                                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end" side="left">
                          <CalendarUI
                            mode="single"
                            selected={undefined}
                            onSelect={(date) => handleDeadlineChange(p.id, date)}
                            locale={es}
                            initialFocus
                          />
                          <div className="p-2 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs font-normal text-muted-foreground"
                              onClick={() => handleDeadlineChange(p.id, undefined, true)}
                            >
                              Sin límite de tiempo
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}

                    {pendingDeadlineRdas.map((r) => (
                      <Popover
                        key={`rda-${r.id}`}
                        open={deadlinePickerOpenId === `rda-${r.id}`}
                        onOpenChange={(open) =>
                          setDeadlinePickerOpenId(open ? `rda-${r.id}` : null)
                        }
                      >
                        <PopoverTrigger asChild>
                          <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/70 border border-transparent hover:border-border transition-all group cursor-pointer">
                            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30 mt-0.5">
                              <Calendar className="size-4 text-purple-600 dark:text-purple-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <Badge variant="outline" className="text-[9px] px-1.5 py-0 border-purple-400/40 text-purple-600">
                                  RDA
                                </Badge>
                                <p className="text-sm font-semibold text-foreground truncate leading-snug">
                                  {getRdaDisplayName(r, "Sin título")}
                                </p>
                              </div>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {r.portada?.autorOriginal || r.context?.iniciadoPor || "Usuario"} ·{" "}
                                <span className="text-foreground/60">
                                  {r.context?.area || r.context?.planta || "-"}
                                </span>
                              </p>
                              <div className="flex items-center gap-1 mt-1.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                                <span>Asignar fecha límite</span>
                                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                              </div>
                            </div>
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end" side="left">
                          <CalendarUI
                            mode="single"
                            selected={undefined}
                            onSelect={(date) => handleRdaDeadlineChange?.(r.id, date)}
                            locale={es}
                            initialFocus
                          />
                          <div className="p-2 border-t border-border">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="w-full justify-start text-xs font-normal text-muted-foreground"
                              onClick={() => handleRdaDeadlineChange?.(r.id, undefined, true)}
                            >
                              Sin límite de tiempo
                            </Button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    ))}
                  </>
                ) : (
                  <div className="py-10 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">¡Todo al día!</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-[220px] mx-auto">
                      Todos los PDCAs y RDAs tienen fecha límite asignada.
                    </p>
                  </div>
                )
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Sin alertas administrativas</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">
                    No tienes avisos pendientes por el momento.
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        {/* Menú Rápido de Perfil de Usuario */}
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
                  {currentUser.position
                    ? `${currentUser.position} · ${currentUser.area}`
                    : currentUser.area}
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

              {/* Resumen rápido de carga de trabajo del usuario */}
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
                    {sidebarPinned ? <Pin className="size-4 text-primary" /> : <PinOff className="size-4 text-muted-foreground" />}
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
      </div>
    </header>
  );
};
