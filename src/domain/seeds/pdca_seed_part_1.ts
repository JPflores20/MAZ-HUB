/**
 * Primera parte del catálogo semilla de proyectos PDCA para entornos locales o inicialización de Firestore.
 */
import type { Pdca } from "../models/pdca";

/** Proyectos PDCA semilla iniciales (envasado y setup SMED). */
export const SEED_PDCAS_PART_1: Pdca[] = [
  {
    id: "PDCA-2026-014",
    titulo: "Reducción de merma en línea de envasado L3",
    area: "Producción / Envasado",
    fase: "Do",
    actualizado: "24 Ago 2026",
    fecha_finalizacion: "2026-10-31",
    progreso: 45,
    problema:
      "La línea de envasado L3 presenta una merma de botella de 2.8% contra un objetivo de 1.5%, generando un sobrecosto estimado de $180,000 MXN mensuales.",
    causa_raiz:
      "Análisis 5 Por Qués + Ishikawa: el desajuste del tornillo alimentador provoca golpes entre botellas al ingresar al llenador. Causa raíz: no existe estándar de ajuste tras cambio de formato y el personal del turno nocturno no está certificado en el setup.",
    acciones: [
      {
        id: "a1",
        what: "Levantar estándar visual de ajuste del tornillo alimentador",
        who: "Ana López",
        when: "12 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "a2",
        what: "Certificar a 6 operadores del turno nocturno en cambio de formato",
        who: "Miguel Ortega",
        when: "22 Ago 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "a3",
        what: "Instalar guarda-guía en curva de entrada al llenador",
        who: "Mantenimiento L3",
        when: "29 Ago 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "a4",
        what: "Registrar merma por hora en tablero SIC durante 3 semanas",
        who: "Ana López",
        when: "05 Sep 2026",
        status: "Pendiente",
        done: false,
      },
    ],
    verificacion:
      "Semanas 34 y 35: merma promedio de 1.9% (‑0.9 pp vs. línea base). El turno nocturno pasó de 3.4% a 2.1%. Se mantiene seguimiento hasta cerrar 4 semanas consecutivas bajo 1.8%.",
    evidencias: ["estandar_visual_L3.pdf", "matriz_certificacion_nocturno.xlsx"],
    estandarizacion:
      "Incorporar el estándar de ajuste al OPL de la línea, actualizar la lista de verificación de arranque y replicar en L2 durante septiembre.",
    indicador: { etiqueta: "Merma de botella", antes: 2.8, despues: 1.9, unidad: "%" },
    serie: [
      { mes: "May", valor: 2.9 },
      { mes: "Jun", valor: 2.8 },
      { mes: "Jul", valor: 2.6 },
      { mes: "Ago", valor: 1.9 },
    ],
  },
  {
    id: "PDCA-2026-011",
    titulo: "Disminución de tiempo de setup en cambio de SKU",
    area: "Ingeniería de Procesos",
    fase: "Check",
    actualizado: "21 Ago 2026",
    progreso: 72,
    problema:
      "El cambio de SKU en la llenadora toma 68 minutos en promedio contra un benchmark corporativo de 40 minutos.",
    causa_raiz:
      "Estudio SMED: el 41% del tiempo es actividad interna que podría convertirse en externa (preparación de herramientas y refacciones fuera de línea).",
    acciones: [
      {
        id: "b1",
        what: "Convertir preparación de herramental a actividad externa (carro SMED)",
        who: "Ana López",
        when: "08 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "b2",
        what: "Estandarizar secuencia de 2 personas con reparto de tareas",
        who: "Jorge Rivas",
        when: "14 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "b3",
        what: "Medir 10 cambios y validar estabilidad del nuevo estándar",
        who: "Ana López",
        when: "26 Ago 2026",
        status: "En progreso",
        done: false,
      },
    ],
    verificacion:
      "10 cambios medidos: promedio de 46 min (‑32%). Desviación estándar de 5.2 min, aceptable para estandarizar.",
    evidencias: ["video_smed_cambio_sku.mp4", "bitacora_10_cambios.xlsx"],
    estandarizacion: "",
    indicador: { etiqueta: "Tiempo de setup", antes: 68, despues: 46, unidad: "min" },
    serie: [
      { mes: "May", valor: 68 },
      { mes: "Jun", valor: 64 },
      { mes: "Jul", valor: 55 },
      { mes: "Ago", valor: 46 },
    ],
  },
];
