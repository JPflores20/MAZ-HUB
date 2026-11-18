/**
 * @fileoverview Catálogo declarativo de criterios y escalas de calificación de la auditoría PDCA / ITF R2D2 + 1.
 */
import type { ItfR2d2Evaluation } from "@/domain/models/pdca";

export type ClaveCriterioR2d2 = Exclude<keyof ItfR2d2Evaluation, "evaluators">;

export interface DefinicionCriterioR2d2 {
  clave: ClaveCriterioR2d2;
  letra: string;
  titulo: string;
  subtitulo: string;
  puntos_guia: string[];
}

export const OPCIONES_CALIFICACION_R2D2 = [
  { value: "0", label: "0 (No cumple)" },
  { value: "1", label: "1 (Necesita mejorar)" },
  { value: "2", label: "2 (Cumplimiento mínimo)" },
  { value: "3", label: "3 (Excelente)" },
  { value: "4", label: "4 (Benchmark)" },
];

export const CRITERIOS_EVALUACION_R2D2: DefinicionCriterioR2d2[] = [
  {
    clave: "rightPeople",
    letra: "R",
    titulo: "Gente Correcta",
    subtitulo: "",
    puntos_guia: [
      "Evite demasiados chefs y no suficientes cocineros",
      "Los ojos externos pueden ser muy perspicaces",
      "¡La primera línea es tu amiga!",
      "El rol de consultor es una opción",
    ],
  },
  {
    clave: "rightProblem",
    letra: "R",
    titulo: "Problema Correcto",
    subtitulo: "",
    puntos_guia: [
      "Alinee con un objetivo y un cronograma realistas, pero adecuadamente extendidos para lograrlo",
      "Acuerde cómo medirá el éxito; puede que no sea a través del KPI principal al principio",
      "Los buenos equipos de ITF y PDCA no dudan en volver a escribir la definición de su problema",
    ],
  },
  {
    clave: "dataWillSetYouFree",
    letra: "D",
    titulo: "Los datos te liberarán",
    subtitulo: "",
    puntos_guia: [
      "¿Tienes datos? Córtalos y córtalos / ¿No tienes datos? Ve a buscarlos",
      "Manténgalo simple... los paretos para reducir el enfoque del equipo rápidamente",
      "Comience a usar el Plan de acción del PDCA inmediatamente",
    ],
  },
  {
    clave: "dontReinventTheWheel",
    letra: "D",
    titulo: "No reinventes la rueda",
    subtitulo: "",
    puntos_guia: [
      "Buenas prácticas operativas (GOP)",
      "Recomendaciones de proveedores",
      "Amigos en todo el mundo",
      "Lista de Verificación SDCA",
    ],
  },
  {
    clave: "noHippos",
    letra: "+1",
    titulo: "Sin hipopótamos",
    subtitulo: "No te quedes atascado en el barro",
    puntos_guia: [
      "La lista de verificación SDCA debe ser rápida",
      "Múltiples PDCAs como ramificaciones",
      "Zona involucrada",
      "Nuevos miembros al equipo",
      "Redefinir objetivos. Obtener más datos",
    ],
  },
];
