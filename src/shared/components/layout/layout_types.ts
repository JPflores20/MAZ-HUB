/**
 * @fileoverview Shared TypeScript contracts for navigation items, layout user metadata, and workload summaries.
 */

import type React from "react";

/** Represents a navigation destination rendered in desktop and mobile menus. */
export interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  external?: boolean | undefined;
  placeholder?: boolean | undefined;
}

/** Normalized user profile metadata consumed by sidebar, header, and profile popovers. */
export interface UserContextData {
  id: string;
  uid?: string | undefined;
  email: string;
  name: string;
  area: string;
  role: "admin" | "user";
  position?: string | undefined;
  plant?: string | undefined;
  phone?: string | undefined;
  avatarUrl?: string | undefined;
  bio?: string | undefined;
}

/** Aggregated active project and pending action counts for the signed-in user. */
export interface UserWorkloadStats {
  activePdcas: number;
  activeRdas: number;
  pendingActions: number;
}
