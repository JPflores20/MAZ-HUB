import { ReactNode, useState, useEffect, useMemo } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import { LayoutDashboard, ClipboardList, Users, ShieldAlert } from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

import { useAuth } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { updatePdcaDeadline } from "@/services/pdca-service";

import { LayoutSidebar } from "./layout/layout-sidebar";
import { LayoutHeader } from "./layout/layout-header";
import { LayoutMobileMenu } from "./layout/layout-mobile-menu";
import type { NavItem, UserContextData } from "./layout/layout-types";

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouterState();
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth();
  const currentPath = router.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const { allPdcas } = usePdcas();
  const [deadlinePickerOpenId, setDeadlinePickerOpenId] = useState<string | null>(null);

  const handleDeadlineChange = async (
    pdcaId: string,
    date: Date | undefined,
    isNoLimit = false,
  ) => {
    if (isNoLimit) {
      await updatePdcaDeadline(pdcaId, "Sin límite");
    } else {
      const formatted = date && isValid(date) ? format(date, "dd/MM/yyyy", { locale: es }) : "";
      await updatePdcaDeadline(pdcaId, formatted || null);
    }
    setDeadlinePickerOpenId(null);
  };

  const pendingDeadlinePdcas = useMemo(() => {
    if (currentUser?.role !== "admin") return [];
    return allPdcas.filter((p) => !p.fechaFinalizacion || p.fechaFinalizacion.trim() === "");
  }, [allPdcas, currentUser?.role]);

  const publicRoutes = ["/login", "/register", "/forgot-password"];
  const isPublicRoute = publicRoutes.includes(currentPath);

  useEffect(() => {
    if (!loading && !currentUser && !isPublicRoute) {
      navigate({ to: "/login" });
    }
  }, [loading, currentUser, isPublicRoute, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
        Cargando plataforma...
      </div>
    );
  }

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (!currentUser) return null;

  const handleLogout = async () => {
    await logout();
    navigate({ to: "/login" });
  };

  const navItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/", label: "Mis PDCAs", icon: ClipboardList },
    { href: "/rda", label: "Mis RDAs", icon: ShieldAlert },
  ];

  if (currentUser.role === "admin") {
    navItems.push({ href: "/admin", label: "Administración", icon: Users });
  }

  const userInitials = currentUser.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  const userContextData: UserContextData = currentUser as UserContextData;

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar (Desktop) */}
      <LayoutSidebar
        desktopSidebarOpen={desktopSidebarOpen}
        navItems={navItems}
        currentPath={currentPath}
        currentUser={userContextData}
        userInitials={userInitials}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <LayoutHeader
          setMobileMenuOpen={setMobileMenuOpen}
          desktopSidebarOpen={desktopSidebarOpen}
          setDesktopSidebarOpen={setDesktopSidebarOpen}
          currentUser={userContextData}
          userInitials={userInitials}
          pendingDeadlinePdcas={pendingDeadlinePdcas}
          deadlinePickerOpenId={deadlinePickerOpenId}
          setDeadlinePickerOpenId={setDeadlinePickerOpenId}
          handleDeadlineChange={handleDeadlineChange}
        />

        {/* Mobile menu overlay */}
        <LayoutMobileMenu
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          navItems={navItems}
          currentPath={currentPath}
          handleLogout={handleLogout}
        />

        {/* Page Content */}
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
