/**
 * layout.tsx
 * Layout estructural de la aplicación con barra lateral colapsable, encabezado superior, selector de idioma y área de contenido.
 */
import { ReactNode, useState, useEffect, useMemo, useRef } from "react";
import { useRouterState, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  ShieldAlert,
  Settings,
  Layers,
  AlertOctagon,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";

import { useAuth } from "@/context/auth-context";
import { usePdcas } from "@/context/pdca-context";
import { useRdas } from "@/context/rda-context";
import { updatePdcaDeadline } from "@/services/pdca-service";
import { updateRda } from "@/services/rda-service";
import { defaultRda } from "@/data/rda";

import { LayoutSidebar } from "./layout/layout-sidebar";
import { LayoutHeader } from "./layout/layout-header";
import { LayoutMobileMenu } from "./layout/layout-mobile-menu";
import type { NavItem, UserContextData } from "./layout/layout-types";

function BrewKettleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Chimenea superior */}
      <path d="M10 2.5h4v4.5h-4z" />
      {/* Domo cónico y cuerpo cilíndrico de la olla */}
      <path d="M10 7 4 11v7c0 1.2 3.6 2 8 2s8-.8 8-2v-7l-6-4" />
      {/* Costura horizontal del domo */}
      <path d="M4 11h16" />
      {/* Escotilla / manway inclinada en el domo izquierdo */}
      <path d="M5.5 9.8 4.6 8.5l2.8-1.9.9 1.3" />
      {/* Base / patas de soporte */}
      <path d="M5.5 22v-2.2h13V22" />
    </svg>
  );
}

export function AppLayout({ children }: { children: ReactNode }) {
  const router = useRouterState();
  const navigate = useNavigate();
  const { currentUser, logout, loading } = useAuth();
  const currentPath = router.location.pathname;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [desktopSidebarOpen, setDesktopSidebarOpen] = useState(true);
  const [sidebarPinned, setSidebarPinned] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("maz_hub_sidebar_pinned");
      return saved ? saved === "true" : true;
    } catch {
      return true;
    }
  });
  const mainRef = useRef<HTMLElement>(null);
  const { allPdcas, pdcaList, updatePdcaInCache } = usePdcas();
  const { allRdas, rdaList, updateRdaInCache } = useRdas();
  const [deadlinePickerOpenId, setDeadlinePickerOpenId] = useState<string | null>(null);

  const toggleSidebarPinned = () => {
    setSidebarPinned((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("maz_hub_sidebar_pinned", String(next));
      } catch {
        // ignore
      }
      if (next) setDesktopSidebarOpen(true);
      return next;
    });
  };

  useEffect(() => {
    if (sidebarPinned) return;
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

      // Si el usuario desancló el sidebar y hace scroll hacia abajo (>20px), colapsar
      if (currentScrollTop > 20 && currentScrollTop > lastScrollTop) {
        setDesktopSidebarOpen(false);
      } else if (currentScrollTop <= 10) {
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
  }, [sidebarPinned]);

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
    const newValue = isNoLimit
      ? "Sin límite"
      : date && isValid(date)
        ? format(date, "dd/MM/yyyy", { locale: es })
        : "";
    await updatePdcaDeadline(pdcaId, newValue || null);
    const existing = allPdcas.find((p) => p.id === pdcaId);
    if (existing) {
      updatePdcaInCache({ ...existing, fechaFinalizacion: newValue });
    }
    setDeadlinePickerOpenId(null);
  };

  const handleRdaDeadlineChange = async (
    rdaId: string,
    date: Date | undefined,
    isNoLimit = false,
  ) => {
    const existing = allRdas.find((r) => r.id === rdaId);
    if (!existing) return;
    const newValue = isNoLimit
      ? "Sin límite"
      : date && isValid(date)
        ? date.toISOString()
        : "";
    const saved = await updateRda({
      ...existing,
      portada: {
        ...(existing.portada || defaultRda.portada!),
        fechaLimite: newValue,
      },
    });
    updateRdaInCache(saved);
    setDeadlinePickerOpenId(null);
  };

  const pendingDeadlinePdcas = useMemo(() => {
    if (currentUser?.role !== "admin") return [];
    return allPdcas.filter((p) => !p.fechaFinalizacion || p.fechaFinalizacion.trim() === "");
  }, [allPdcas, currentUser?.role]);

  const pendingDeadlineRdas = useMemo(() => {
    if (currentUser?.role !== "admin") return [];
    return allRdas.filter(
      (r) => !r.portada?.fechaLimite || r.portada.fechaLimite.trim() === "",
    );
  }, [allRdas, currentUser?.role]);

  const userStats = useMemo(() => {
    const activePdcas = pdcaList.filter((p) => p.fase !== "Act").length;
    const activeRdas = rdaList.filter((r) => r.status !== "Cerrado" && r.status !== "Evaluado").length;
    const pendingActions =
      pdcaList.flatMap((p) => p.acciones || []).filter((a) => !a.done && a.status !== "Completada").length +
      rdaList.flatMap((r) => r.pda || []).filter((a) => !a.done && a.status !== "Completada").length;
    return { activePdcas, activeRdas, pendingActions };
  }, [pdcaList, rdaList]);

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
    {
      href: "https://splan.ab-inbev.com/login",
      label: "SPLAN",
      icon: Layers,
      external: true,
    },
    {
      href: "#pre-incidentes-proceso",
      label: "Pre Incidentes Proceso",
      icon: BrewKettleIcon,
      placeholder: true,
    },
    {
      href: "#usabilidad-htas",
      label: "Usabilidad Htas",
      icon: AlertOctagon,
      placeholder: true,
    },
  ];

  if (currentUser.role === "admin") {
    navItems.push({ href: "/admin", label: "Administración", icon: Users });
  }

  navItems.push({ href: "/configuracion", label: "Configuración", icon: Settings });

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
          sidebarPinned={sidebarPinned}
          onToggleSidebarPinned={toggleSidebarPinned}
          currentUser={userContextData}
          userInitials={userInitials}
          userStats={userStats}
          handleLogout={handleLogout}
          pendingDeadlinePdcas={pendingDeadlinePdcas}
          pendingDeadlineRdas={pendingDeadlineRdas}
          deadlinePickerOpenId={deadlinePickerOpenId}
          setDeadlinePickerOpenId={setDeadlinePickerOpenId}
          handleDeadlineChange={handleDeadlineChange}
          handleRdaDeadlineChange={handleRdaDeadlineChange}
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
