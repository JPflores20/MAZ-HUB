/**
 * @fileoverview Single desktop sidebar navigation link/button with active highlight and localization support.
 */

import type React from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink } from "lucide-react";
import { useTranslation } from "react-i18next";
import { cn } from "@/shared/utils/class_names";
import type { NavItem } from "./layout_types";

interface LayoutSidebarNavItemProps {
  navItem: NavItem;
  desktopSidebarOpen: boolean;
  currentPath: string;
}

/**
 * Renders an internal TanStack Link, safe external anchor, or non-interactive placeholder item.
 *
 * @param {LayoutSidebarNavItemProps} props - Navigation entry config, sidebar expansion state, and active route.
 * @returns {React.ReactElement} Styled navigation item for desktop sidebar.
 */
export const LayoutSidebarNavItem: React.FC<LayoutSidebarNavItemProps> = ({
  navItem,
  desktopSidebarOpen,
  currentPath,
}) => {
  const { t } = useTranslation();
  const is_active = !navItem.external && !navItem.placeholder && currentPath === navItem.href;

  const nav_item_classes = cn(
    "group flex w-full items-center rounded-xl text-sm font-semibold transition-all duration-150 whitespace-nowrap overflow-hidden",
    desktopSidebarOpen ? "gap-3.5 px-4 py-3" : "justify-center p-3",
    is_active
      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/35"
      : "text-blue-100/75 hover:bg-white/10 hover:text-white",
  );

  const normalized_translation_key = navItem.label
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const nav_item_content = (
    <>
      <navItem.icon
        className={`size-5 shrink-0 transition-colors ${
          is_active ? "text-white" : "text-blue-200/70 group-hover:text-white"
        }`}
      />
      <span
        className={cn(
          "truncate transition-all duration-300",
          desktopSidebarOpen ? "w-auto opacity-100 ml-0" : "w-0 opacity-0 hidden",
        )}
      >
        {t(normalized_translation_key, { defaultValue: navItem.label })}
      </span>
      {navItem.external && desktopSidebarOpen && (
        <ExternalLink className="ml-auto size-3.5 text-blue-200/50 group-hover:text-white shrink-0" />
      )}
      {is_active && desktopSidebarOpen && (
        <div className="ml-auto size-1.5 rounded-full bg-white/60 shrink-0" />
      )}
    </>
  );

  if (navItem.placeholder) {
    return (
      <button
        type="button"
        className={cn(nav_item_classes, "cursor-default text-left")}
        title={!desktopSidebarOpen ? navItem.label : undefined}
      >
        {nav_item_content}
      </button>
    );
  }

  if (navItem.external) {
    return (
      <a
        href={navItem.href}
        target="_blank"
        rel="noopener noreferrer"
        className={nav_item_classes}
        title={!desktopSidebarOpen ? navItem.label : `Abrir ${navItem.label}`}
      >
        {nav_item_content}
      </a>
    );
  }

  return (
    <Link
      to={navItem.href}
      className={nav_item_classes}
      title={!desktopSidebarOpen ? navItem.label : undefined}
    >
      {nav_item_content}
    </Link>
  );
};
