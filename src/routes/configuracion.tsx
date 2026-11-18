/**
 * @fileoverview Thin TanStack Router adapter for the `/configuracion` user settings route.
 */

import { createFileRoute } from "@tanstack/react-router";
import { UserSettingsView } from "@/features/settings";

export const Route = createFileRoute("/configuracion")({
  component: UserSettingsView,
});
