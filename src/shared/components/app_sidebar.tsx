/**
 * app_sidebar.tsx
 * Componente alternativo de barra lateral basada en primitivas `Sidebar` de shadcn/ui.
 */
import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, FileStack, Lock } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/shared/ui/sidebar";

const SIDEBAR_MODULES = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Mis PDCAs", url: "/", icon: ClipboardList },
];

/**
 * Barra lateral colapsable por iconos para navegación rápida entre módulos.
 *
 * @returns Estructura completa de `<Sidebar />` con encabezado, menú y pie institucional.
 */
export function AppSidebar() {
  const current_path = useRouterState({ select: (router_state) => router_state.location.pathname });

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-md bg-brand-yellow font-display text-lg font-bold text-brand-yellow-foreground">
            GM
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate font-display text-base font-semibold uppercase tracking-wide">
              Grupo Modelo
            </p>
            <p className="truncate text-xs text-sidebar-foreground/70">Plataforma MAZ HUB</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/60">Módulos</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_MODULES.map((sidebar_module) => (
                <SidebarMenuItem key={sidebar_module.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={current_path === sidebar_module.url}
                    tooltip={sidebar_module.title}
                  >
                    <Link to={sidebar_module.url}>
                      <sidebar_module.icon />
                      <span>{sidebar_module.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              <SidebarMenuItem>
                <SidebarMenuButton
                  disabled
                  tooltip="Mis RDAs — Próximamente"
                  className="opacity-50"
                >
                  <FileStack />
                  <span>Mis RDAs</span>
                  <Lock className="ml-auto size-3.5" />
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-3 rounded-md bg-sidebar-accent px-2 py-2">
          <div className="grid size-9 shrink-0 place-items-center rounded-full bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
            AL
          </div>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-sm font-semibold">Becaria: Ana López</p>
            <p className="truncate text-xs text-sidebar-foreground/70">Ingeniería de Software</p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
