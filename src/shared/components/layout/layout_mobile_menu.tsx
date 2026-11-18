/**
 * @fileoverview Responsive off-canvas mobile navigation drawer with safe external link handling.
 */

import type React from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, LogOut, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import type { NavItem } from "./layout_types";

/** Props accepted by LayoutMobileMenu. */
export interface LayoutMobileMenuProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  navItems: NavItem[];
  currentPath: string;
  handleLogout: () => void;
}

/**
 * Renders a slide-over mobile navigation drawer visible below the `md` breakpoint.
 *
 * @param {LayoutMobileMenuProps} props - Open state, navigation items, route path, and logout handler.
 * @returns {React.ReactElement | null} Overlay drawer when open, or null when closed.
 */
export const LayoutMobileMenu: React.FC<LayoutMobileMenuProps> = ({
  mobileMenuOpen,
  setMobileMenuOpen,
  navItems,
  currentPath,
  handleLogout,
}) => {
  if (!mobileMenuOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
      <div className="relative flex w-64 max-w-xs flex-col bg-brand-dark text-white shadow-xl">
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <img
              src="/logos/MAZ.webp"
              alt="Logo MAZ"
              className="h-8 w-auto object-contain rounded"
            />
            <span className="font-display text-lg font-bold uppercase tracking-wide">MAZ HUB</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 hover:text-white"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X className="size-5" />
          </Button>
        </div>

        <nav className="flex-1 space-y-1.5 p-4">
          {navItems.map((nav_item) =>
            nav_item.placeholder ? (
              <button
                key={nav_item.href}
                type="button"
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors text-white/70 hover:bg-white/10 hover:text-white cursor-default"
              >
                <nav_item.icon className="size-5" />
                <span>{nav_item.label}</span>
              </button>
            ) : nav_item.external ? (
              <a
                key={nav_item.href}
                href={nav_item.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-white/70 hover:bg-white/10 hover:text-white"
              >
                <nav_item.icon className="size-5" />
                <span>{nav_item.label}</span>
                <ExternalLink className="ml-auto size-3.5 text-white/50" />
              </a>
            ) : (
              <Link
                key={nav_item.href}
                to={nav_item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  currentPath === nav_item.href
                    ? "bg-brand text-white shadow-sm"
                    : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}
              >
                <nav_item.icon className="size-5" />
                {nav_item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="border-t border-white/10 p-4">
          <Button
            variant="ghost"
            className="w-full justify-start text-white/70 hover:bg-white/10 hover:text-white"
            onClick={() => {
              handleLogout();
              setMobileMenuOpen(false);
            }}
          >
            <LogOut className="mr-3 size-5" />
            Cerrar Sesión
          </Button>
          <div className="mt-6 text-center text-[10px] text-white/30 leading-tight">
            <p className="font-semibold uppercase tracking-widest">Cerveceria Zacatecas</p>
            <p className="mt-1.5">Creado: Ing. en Soft. José Luis Flores</p>
          </div>
        </div>
      </div>
    </div>
  );
};
