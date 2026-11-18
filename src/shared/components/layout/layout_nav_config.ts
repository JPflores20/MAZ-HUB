/**
 * @fileoverview Static route lists and navigation builder helpers for the application shell.
 */

import {
  AlertOctagon,
  ClipboardList,
  Layers,
  LayoutDashboard,
  MessageSquareText,
  Settings,
  ShieldAlert,
  Users,
} from "lucide-react";
import { BrewKettleIcon } from "./brew_kettle_icon";
import type { NavItem } from "./layout_types";

/** Unauthenticated auth paths rendered without the main sidebar/header frame. */
export const PUBLIC_AUTH_ROUTES = ["/login", "/register", "/forgot-password"];

/**
 * Builds the sidebar and mobile drawer navigation items for the signed-in user's role.
 *
 * @param {string} user_role - Role identifier from the user's profile (`admin`, `user`, etc.).
 * @returns {NavItem[]} Ordered array of internal and external navigation entries.
 */
export function build_layout_nav_items(user_role: string): NavItem[] {
  const base_items: NavItem[] = [
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
      href: "https://interactionlog.ab-inbev.com/home",
      label: "Interaction Log",
      icon: MessageSquareText,
      external: true,
    },
    {
      href: "/pre-incidentes-proceso",
      label: "Pre Incidentes Proceso",
      icon: BrewKettleIcon,
    },
    {
      href: "/usabilidad-htas",
      label: "Usabilidad Htas",
      icon: AlertOctagon,
    },
  ];

  if (user_role === "admin") {
    base_items.push({ href: "/admin", label: "Administración", icon: Users });
  }

  base_items.push({ href: "/configuracion", label: "Configuración", icon: Settings });
  return base_items;
}

/**
 * Extracts up to two uppercase initials from a user's display name for avatar fallbacks.
 *
 * @param {string} display_name - Full display name of the user.
 * @returns {string} Up to two uppercase initials.
 */
export function compute_user_initials(display_name: string): string {
  return display_name
    .split(" ")
    .map((name_part) => name_part[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
