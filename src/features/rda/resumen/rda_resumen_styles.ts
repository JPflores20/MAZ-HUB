/**
 * @fileoverview Shared printable CSS tokens, date formatting, and status semaphore styles for Fase 1 Resumen.
 */

import type React from "react";

export const RESUMEN_TH_CLASS =
  "border border-black/30 bg-[#0078D7] p-1.5 font-bold text-[10px] text-center text-white uppercase";
export const RESUMEN_TD_CLASS =
  "border border-black/30 p-1 text-xs text-center text-blue-800 font-medium bg-white";
export const RESUMEN_TD_JUSTIFY_CLASS =
  "border border-black/30 p-1.5 text-xs text-justify text-blue-800 font-medium bg-white";
export const RESUMEN_INPUT_CLASS =
  "w-full bg-transparent text-xs text-center text-blue-800 font-medium outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 placeholder:text-slate-400";
export const RESUMEN_SELECT_CLASS =
  "w-full bg-white text-xs text-center text-blue-800 font-medium outline-none focus:ring-1 focus:ring-blue-500 rounded px-1 py-0.5 cursor-pointer";
export const RESUMEN_HEADER_DIV_CLASS =
  "bg-[#0078D7] border border-black/30 p-1.5 font-bold text-center text-xs uppercase text-white mt-6";
export const RESUMEN_TEXT_DIV_CLASS =
  "border border-t-0 border-black/30 p-3 text-xs text-blue-800 text-justify font-medium bg-white min-h-[40px]";

/** Formats ISO date strings as `DD/MM/YYYY` for print tables. */
export function format_resumen_date(iso_string?: string): string {
  if (!iso_string) return "-";
  const date_part = iso_string.includes("T") ? (iso_string.split("T")[0] ?? "") : iso_string;
  const [year, month, day] = date_part.split("-");
  return year && month && day ? `${day}/${month}/${year}` : iso_string;
}

/** Returns print-safe semaphore class and inline fill colors for execution statuses. */
export function get_resumen_status_cell_props(raw_status?: string): {
  className: string;
  style?: React.CSSProperties;
} {
  const normalized = String(raw_status || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();

  if (["completa", "completada", "completo", "complete", "completed"].includes(normalized)) {
    return {
      className: "border border-black/30 p-1 text-xs text-center font-bold bg-[#92D050] text-black",
      style: { backgroundColor: "#92D050", color: "#000000" },
    };
  }
  if (["en progreso", "en proceso", "in progress"].includes(normalized)) {
    return {
      className: "border border-black/30 p-1 text-xs text-center font-bold bg-[#FFC000] text-black",
      style: { backgroundColor: "#FFC000", color: "#000000" },
    };
  }
  if (["retrasado", "retrasada", "delayed", "vencido", "vencida"].includes(normalized)) {
    return {
      className: "border border-black/30 p-1 text-xs text-center font-bold bg-[#FF0000] text-white",
      style: { backgroundColor: "#FF0000", color: "#FFFFFF" },
    };
  }
  return { className: RESUMEN_TD_CLASS };
}
