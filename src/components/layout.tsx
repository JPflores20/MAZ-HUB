/**
 * layout.tsx
 * Layout estructural de la aplicación con barra lateral colapsable, encabezado superior, selector de idioma y área de contenido.
 */
import { ReactNode, useState, useEffect, useMemo, useRef } from "react";
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
  const mainRef = useRef<HTMLElement>(null);
  const { allPdcas } = usePdcas();
  const [deadlinePickerOpenId, setDeadlinePickerOpenId] = useState<string | null>(null);

  useEffect(() => {
    let lastScrollTop = 0;
    const mainEl = mainRef.current;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | Document | null;
      let currentScrollTop = 0;

      if (target === document || target === document.documentElement) {
        currentScrollTop = window.scrollY || document.documentElement.scrollTop;
      } else if (target && "scrollTop" in target) {
        currentScrollTop = (target as HTMLElement).scrollTop;
      } else if (mainEl) {
        currentScrollTop = mainEl.scrollTop;
      }

      // Si hace scroll hacia abajo (más de 20px de desplazamiento), colapsar el sidebar automáticamente
      if (currentScrollTop > 20 && currentScrollTop > lastScrollTop) {
        setDesktopSidebarOpen(false);
      } else if (currentScrollTop <= 10) {
        // Al regresar al tope superior, expandir el sidebar
        setDesktopSidebarOpen(true);
      }

      lastScrollTop = currentScrollTop;
    };

    mainEl?.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      mainEl?.removeEventListener("scroll", handleScroll);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (mainRef.current) {
      mainRef.current.scrollTop = 0;
    }
    setDesktopSidebarOpen(true);
  }, [currentPath]);

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

  const userContextData: UserContextData = currentUser as unknown as UserContextData;

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
        <main ref={mainRef} className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
