/**
 * index.ts
 * Exportación pública del sistema modular de barra lateral (`Sidebar`).
 */
export { useSidebar, SidebarProvider } from "./sidebar_context";
export { Sidebar, SidebarTrigger, SidebarRail, SidebarInset } from "./sidebar_shell";
export {
  SidebarInput,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupAction,
  SidebarGroupContent,
} from "./sidebar_sections";
export {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuAction,
  SidebarMenuBadge,
} from "./sidebar_menu";
export {
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "./sidebar_sub_menu";
