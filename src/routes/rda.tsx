/**
 * @fileoverview Route adapter for `/rda` delegating UI rendering to RdaBankView.
 */

import { createFileRoute } from "@tanstack/react-router";
import { RdaBankView } from "@/features/rda";

export const Route = createFileRoute("/rda")({
  component: RdaBankView,
});
