/**
 * Utilidad compartida para combinar clases CSS condicionalmente evitando colisiones de Tailwind.
 */
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina múltiples expresiones de clases CSS y resuelve conflictos entre utilidades Tailwind.
 * @param entradas_clase - Lista variable de clases, arreglos u objetos condicionales.
 * @returns Cadena final normalizada con las clases activas.
 */
export function cn(...entradas_clase: ClassValue[]): string {
  return twMerge(clsx(entradas_clase));
}
