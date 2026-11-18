/**
 * @fileoverview Thin TanStack Router adapter for the `/admin` user management route.
 */

import { createFileRoute } from "@tanstack/react-router";
import { AdminPanel } from "@/features/admin";

export const Route = createFileRoute("/admin")({
  component: AdminPanel,
});
