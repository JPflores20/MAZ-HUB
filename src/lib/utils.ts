/**
 * utils.ts
 * Funciones utilitarias generales, incluyendo la combinación condicional de clases Tailwind (cn).
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
