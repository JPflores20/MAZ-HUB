/**
 * layout-sidebar.tsx
 * Barra lateral principal con enlaces de navegación (Dashboard, PDCAs, RDAs, Administración) y perfil del usuario activo.
 */
import React from "react";
import { Link } from "@tanstack/react-router";
import { LogOut, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { NavItem, UserContextData } from "./layout-types";
import { useTranslation } from "react-i18next";

interface Props {
  desktopSidebarOpen: boolean;
  navItems: NavItem[];
  currentPath: string;
  currentUser: UserContextData;
  userInitials: string;
  handleLogout: () => void;
}

export const LayoutSidebar: React.FC<Props> = ({
  desktopSidebarOpen,
  navItems,
  currentPath,
  currentUser,
  userInitials,
  handleLogout,
}) => {
  const { t, i18n } = useTranslation();

  return (
    <aside
      className={cn(
        "hidden flex-col bg-gradient-to-b from-[#0a1428] via-[#0f1c38] to-[#080e1e] text-white border-r border-slate-800/80 shadow-xl z-10 transition-all duration-300 md:flex",
        desktopSidebarOpen ? "w-[280px]" : "w-[72px]",
      )}
    >
      <div className="flex flex-col items-center justify-center pt-6 pb-4 px-3 text-center shrink-0">
        <Link
          to="/"
          title="MAZ HUB - Zacatecas"
          className="group flex items-center justify-center transition-transform duration-300 hover:scale-105 focus:outline-none"
        >
          <img
            src="/logos/MAZ.webp"
            alt="Logo MAZ"
            className={cn(
              "rounded-full object-cover shadow-2xl transition-all duration-300 ring-2 ring-white/10 group-hover:ring-amber-400/40",
              desktopSidebarOpen ? "size-44" : "size-11",
            )}
          />
        </Link>
      </div>
      <div className="px-5 py-2">
        <div className="h-px w-full bg-white/10"></div>
      </div>

      <nav className="flex-1 space-y-1 p-4 pt-2 overflow-x-hidden">
        {desktopSidebarOpen && (
          <div className="text-xs font-bold text-blue-200/60 mb-3 uppercase tracking-wider px-3 whitespace-nowrap">
            Menú Principal
          </div>
        )}
        {navItems.map((item) => {
          const isActive = !item.external && !item.placeholder && currentPath === item.href;
          const itemClassName = cn(
            "group flex w-full items-center rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap overflow-hidden",
            desktopSidebarOpen ? "gap-3.5 px-4 py-3" : "justify-center p-3",
            isActive
              ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35"
              : "text-blue-100/75 hover:bg-white/10 hover:text-white",
          );

          const itemContent = (
            <>
              <item.icon
                className={`size-5 shrink-0 transition-colors ${
                  isActive ? "text-white" : "text-blue-200/70 group-hover:text-white"
                }`}
              />
              <span
                className={cn(
                  "truncate transition-all duration-300",
                  desktopSidebarOpen ? "w-auto opacity-100 ml-0" : "w-0 opacity-0 hidden",
                )}
              >
                {t(
                  item.label
                    .toLowerCase()
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, ""),
                  { defaultValue: item.label },
                )}
              </span>
              {item.external && desktopSidebarOpen && (
                <ExternalLink className="ml-auto size-3.5 text-blue-200/50 group-hover:text-white shrink-0" />
              )}
              {isActive && desktopSidebarOpen && (
                <div className="ml-auto size-1.5 rounded-full bg-white/60 shrink-0" />
              )}
            </>
          );

          if (item.placeholder) {
            return (
              <button
                key={item.href}
                type="button"
                className={cn(itemClassName, "cursor-default text-left")}
                title={!desktopSidebarOpen ? item.label : undefined}
              >
                {itemContent}
              </button>
            );
          }

          if (item.external) {
            return (
              <a
                key={item.href}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={itemClassName}
                title={!desktopSidebarOpen ? item.label : `Abrir ${item.label}`}
              >
                {itemContent}
              </a>
            );
          }

          return (
            <Link
              key={item.href}
              to={item.href}
              className={itemClassName}
              title={!desktopSidebarOpen ? item.label : undefined}
            >
              {itemContent}
            </Link>
          );
        })}
      </nav>

      {/* User Profile Footer */}
      <div className="border-t border-white/10 p-4 space-y-3 bg-black/20 overflow-x-hidden">
        <Link
          to="/configuracion"
          title="Configuración de mi perfil"
          className={cn(
            "flex items-center gap-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-blue-400/30 transition-all cursor-pointer group",
            desktopSidebarOpen ? "px-2 py-2.5" : "p-0 justify-center border-transparent",
          )}
        >
          {currentUser.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="size-10 shrink-0 rounded-full object-cover shadow-md ring-2 ring-blue-500/40 group-hover:ring-blue-400"
            />
          ) : (
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-sm shadow-md ring-2 ring-blue-500/30 group-hover:ring-blue-400">
              {userInitials}
            </div>
          )}
          {desktopSidebarOpen && (
            <>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white leading-none group-hover:text-blue-200 transition-colors">
                  {currentUser.name}
                </p>
                <p className="truncate text-xs text-blue-300/80 mt-0.5">
                  {currentUser.position ? `${currentUser.position} · ${currentUser.area}` : currentUser.area}
                </p>
              </div>
              <span
                className={`shrink-0 inline-flex items-center text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full ${
                  currentUser.role === "admin"
                    ? "bg-amber-400/20 text-amber-300 border border-amber-400/30"
                    : "bg-blue-500/20 dark:bg-blue-900/30 text-blue-300 border border-blue-500/30"
                }`}
              >
                {currentUser.role === "admin" ? "Admin" : "User"}
              </span>
            </>
          )}
        </Link>
        <Button
          variant="ghost"
          title={!desktopSidebarOpen ? t("logout") : undefined}
          className={cn(
            "w-full text-blue-200/70 hover:bg-red-500 dark:bg-red-600/15 hover:text-red-300 h-9 text-sm font-medium rounded-xl gap-3 transition-all",
            desktopSidebarOpen ? "justify-start" : "justify-center px-0",
          )}
          onClick={handleLogout}
        >
          <LogOut className="size-4 shrink-0" />
          {desktopSidebarOpen && <span>{t("logout")}</span>}
        </Button>
      </div>
    </aside>
  );
};
