/**
 * @fileoverview Lightweight root auth gate and lazy shell loader.
 * Public auth routes render directly without downloading sidebar, header, or PDCA/RDA contexts.
 */

import { lazy, Suspense, useEffect, type ReactNode } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/features/auth/auth_context";
import { PUBLIC_AUTH_ROUTES } from "./layout_nav_config";

const LazyAuthenticatedLayoutShell = lazy(() =>
  import("./authenticated_layout_shell").then((shell_module) => ({
    default: shell_module.AuthenticatedLayoutShell,
  })),
);

function ShellLoadingScreen(): ReactNode {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground">
      Cargando plataforma...
    </div>
  );
}

/**
 * Guards protected routes and defers loading the authenticated layout bundle until a verified session exists.
 *
 * @param {{ children: ReactNode }} props - Active router outlet children.
 * @returns {ReactNode} Public view directly or lazy-loaded authenticated workspace shell.
 */
export function AppLayout({ children }: { children: ReactNode }): ReactNode {
  const router_state = useRouterState();
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const current_path = router_state.location.pathname;
  const is_public_route = PUBLIC_AUTH_ROUTES.includes(current_path);

  useEffect(() => {
    if (!loading && !currentUser && !is_public_route) {
      void navigate({ to: "/login" });
    }
  }, [loading, currentUser, is_public_route, navigate]);

  if (loading) {
    return <ShellLoadingScreen />;
  }

  if (is_public_route) {
    return <>{children}</>;
  }

  if (!currentUser) {
    return null;
  }

  return (
    <Suspense fallback={<ShellLoadingScreen />}>
      <LazyAuthenticatedLayoutShell>{children}</LazyAuthenticatedLayoutShell>
    </Suspense>
  );
}
