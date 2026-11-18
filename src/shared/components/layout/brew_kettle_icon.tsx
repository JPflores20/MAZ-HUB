/**
 * @fileoverview Inline SVG brew kettle icon for the Process Pre-Incidents navigation module.
 */

import type React from "react";

/**
 * Renders the stylized brewing kettle outline icon.
 *
 * @param {{ className?: string | undefined }} props - Optional Tailwind sizing and color classes.
 * @returns {React.ReactElement} Inline SVG icon element.
 */
export function BrewKettleIcon({ className }: { className?: string | undefined }): React.ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Chimenea superior */}
      <path d="M10 2.5h4v4.5h-4z" />
      {/* Domo cónico y cuerpo cilíndrico de la olla */}
      <path d="M10 7 4 11v7c0 1.2 3.6 2 8 2s8-.8 8-2v-7l-6-4" />
      {/* Costura horizontal del domo */}
      <path d="M4 11h16" />
      {/* Escotilla / manway inclinada en el domo izquierdo */}
      <path d="M5.5 9.8 4.6 8.5l2.8-1.9.9 1.3" />
      {/* Base / patas de soporte */}
      <path d="M5.5 22v-2.2h13V22" />
    </svg>
  );
}
