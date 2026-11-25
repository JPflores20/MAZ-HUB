/**
 * @fileoverview Route adapter for `/rda` delegating UI rendering to RdaBankView.
 */

import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

export const Route = createFileRoute("/rda")({
  component: lazyRouteComponent(() => import("@/features/rda/bank/rda_bank_view"), "RdaBankView"),
});
