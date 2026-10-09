import React from "react";
import { Menu, Printer, Bell, CheckCircle2, Calendar, ArrowRight } from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarUI } from "@/components/ui/calendar";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import type { UserContextData } from "./layout-types";

interface Props {
  setMobileMenuOpen: (open: boolean) => void;
  desktopSidebarOpen: boolean;
  setDesktopSidebarOpen: (open: boolean) => void;
  currentUser: UserContextData;
  userInitials: string;
  pendingDeadlinePdcas: any[];
  deadlinePickerOpenId: string | null;
  setDeadlinePickerOpenId: (id: string | null) => void;
  handleDeadlineChange: (id: string, date: Date | undefined, isNoLimit?: boolean) => void;
}

export const LayoutHeader: React.FC<Props> = ({
  setMobileMenuOpen,
  desktopSidebarOpen,
  setDesktopSidebarOpen,
  currentUser,
  userInitials,
  pendingDeadlinePdcas,
  deadlinePickerOpenId,
  setDeadlinePickerOpenId,
  handleDeadlineChange,
}) => {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-800/80 bg-gradient-to-r from-[#0a1428] via-[#0f1c38] to-[#0a1428] text-white px-4 md:px-8 shadow-md relative z-0">
      <div className="flex items-center gap-4">
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
        >
          <Menu className="size-5" />
        </Button>

        <div
          className={cn(
            "flex items-center gap-3",
            desktopSidebarOpen ? "md:hidden" : "hidden md:flex lg:flex"
          )}
        >
          <img
            src="/logos/MAZ.webp"
            alt="Logo MAZ"
            className={cn(
              "h-7 w-auto object-contain rounded",
              desktopSidebarOpen ? "md:hidden" : ""
            )}
          />
          {!desktopSidebarOpen && (
            <span className="font-display font-bold uppercase tracking-wider hidden md:block">
              MAZ HUB
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">


        <ThemeToggle className="text-blue-200/80 hover:bg-white/10 hover:text-white" />

        {/* Notification Bell */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative text-blue-200/80 hover:bg-white/10 hover:text-white"
            >
              <Bell className="size-5" />
              {currentUser.role === "admin" && pendingDeadlinePdcas.length > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[11px] font-bold text-white shadow-md">
                  {pendingDeadlinePdcas.length}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            className="w-80 sm:w-[380px] p-0 border border-border bg-background text-foreground shadow-2xl rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-muted/40">
              <div className="flex items-center gap-2.5">
                <div className="flex size-7 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/40">
                  <Bell className="size-3.5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-foreground leading-none">
                    Notificaciones
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Panel de administración
                  </p>
                </div>
              </div>
              {currentUser.role === "admin" && pendingDeadlinePdcas.length > 0 && (
                <span className="text-xs bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400 px-2.5 py-1 rounded-full font-semibold border border-red-200 dark:border-red-800">
                  {pendingDeadlinePdcas.length} sin fecha
                </span>
              )}
            </div>

            <div className="max-h-[340px] overflow-y-auto p-2 space-y-1">
              {currentUser.role === "admin" ? (
                pendingDeadlinePdcas.length > 0 ? (
                  pendingDeadlinePdcas.map((p) => (
                    <Popover
                      key={p.id}
                      open={deadlinePickerOpenId === p.id}
                      onOpenChange={(open) => setDeadlinePickerOpenId(open ? p.id : null)}
                    >
                      <PopoverTrigger asChild>
                        <div className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/70 border border-transparent hover:border-border transition-all group cursor-pointer">
                          <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30 mt-0.5">
                            <Calendar className="size-4 text-amber-600 dark:text-amber-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate leading-snug">
                              {p.titulo || "Sin título"}
                            </p>
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
                  ))
                ) : (
                  <div className="py-10 text-center">
                    <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
                      <CheckCircle2 className="size-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="font-semibold text-sm text-foreground">¡Todo al día!</p>
                    <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">
                      Todos los PDCAs tienen fecha límite asignada.
                    </p>
                  </div>
                )
              ) : (
                <div className="py-10 text-center">
                  <div className="mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <CheckCircle2 className="size-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="font-semibold text-sm text-foreground">Sin notificaciones</p>
                  <p className="mt-1 text-xs text-muted-foreground max-w-[200px] mx-auto">
                    No tienes avisos pendientes por el momento.
                  </p>
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <div className="flex items-center gap-3 border-l border-white/15 pl-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white leading-none">{currentUser.name}</p>
            <p className="mt-1 text-xs text-blue-300 font-medium">{currentUser.area}</p>
          </div>
          <div className="flex size-9 items-center justify-center rounded-full bg-blue-600 font-bold text-white shadow-md ring-2 ring-blue-500/30">
            {userInitials}
          </div>
        </div>
      </div>
    </header>
  );
};
