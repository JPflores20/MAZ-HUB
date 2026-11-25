/**
 * @fileoverview Thin TanStack Router adapter for the `/configuracion` user settings route.
 */

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/configuracion")({
  component: lazyRouteComponent(
    () => import("@/features/settings/user_settings_view"),
    "UserSettingsView",
  ),
});
