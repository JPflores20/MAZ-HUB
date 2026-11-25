/**
 * @fileoverview Thin TanStack Router adapter for the `/admin` user management route.
 */

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/admin")({
  component: lazyRouteComponent(() => import("@/features/admin/admin_panel"), "AdminPanel"),
});
