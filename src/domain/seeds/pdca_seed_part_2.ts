/**
 * Segunda parte del catálogo semilla de proyectos PDCA (automatización, calidad y portal de becarios).
 */
import type { Pdca } from "../models/pdca";

/** Proyectos PDCA semilla adicionales para completar la colección inicial de demostración. */
export const SEED_PDCAS_PART_2: Pdca[] = [
  {
    id: "PDCA-2026-018",
    titulo: "Automatización del reporte diario de OEE",
    area: "Ingeniería de Software",
    fase: "Plan",
    actualizado: "25 Ago 2026",
    progreso: 15,
    problema:
      "El reporte diario de OEE se consolida manualmente en Excel y toma 90 minutos por turno, con 12% de registros con error de captura.",
    causa_raiz:
      "No existe integración entre el historian de planta y el tablero de indicadores; la captura es doble y sin validación.",
    acciones: [
      {
        id: "c1",
        what: "Mapear fuentes de datos y definir contrato de API con TI Planta",
        who: "Ana López",
        when: "29 Ago 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "c2",
        what: "Prototipar ETL nocturno con validaciones de rango",
        who: "Ana López",
        when: "10 Sep 2026",
        status: "Pendiente",
        done: false,
      },
      {
        id: "c3",
        what: "Publicar tablero piloto para 2 líneas",
        who: "Diego Fuentes",
        when: "24 Sep 2026",
        status: "Pendiente",
        done: false,
      },
    ],
    verificacion: "",
    evidencias: [],
    estandarizacion: "",
    indicador: {
      etiqueta: "Horas de captura / semana",
      antes: 10.5,
      despues: 10.5,
      unidad: "h",
    },
    serie: [
      { mes: "May", valor: 10.5 },
      { mes: "Jun", valor: 10.5 },
      { mes: "Jul", valor: 10.5 },
      { mes: "Ago", valor: 10.5 },
    ],
  },
  {
    id: "PDCA-2026-007",
    titulo: "Estandarización de inspección de calidad en tapa corona",
    area: "Calidad",
    fase: "Act",
    actualizado: "18 Ago 2026",
    progreso: 96,
    problema:
      "Rechazos por torque de tapa fuera de especificación representaban 0.7% del lote embotellado.",
    causa_raiz:
      "Frecuencia de muestreo insuficiente y torquímetros sin calibración vigente en 2 de 5 estaciones.",
    acciones: [
      {
        id: "d1",
        what: "Reprogramar calibración trimestral de torquímetros",
        who: "Laura Méndez",
        when: "22 Jul 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "d2",
        what: "Aumentar muestreo a cada 30 min en arranque de turno",
        who: "Ana López",
        when: "01 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "d3",
        what: "Capacitar a inspectores en nuevo formato de registro",
        who: "Calidad L1-L3",
        when: "12 Ago 2026",
        status: "Completada",
        done: true,
      },
    ],
    verificacion:
      "Cuatro semanas consecutivas con rechazo de 0.15%. Auditoría interna de calidad sin hallazgos mayores.",
    evidencias: ["certificados_calibracion.pdf", "auditoria_interna_ago.pdf"],
    estandarizacion:
      "Actualizado el procedimiento PRO-CAL-014, incluido en inducción de nuevos inspectores y replicado a las 5 estaciones. Cierre firmado por Jefatura de Calidad.",
    indicador: {
      etiqueta: "Rechazo por torque",
      antes: 0.7,
      despues: 0.15,
      unidad: "%",
    },
    serie: [
      { mes: "May", valor: 0.72 },
      { mes: "Jun", valor: 0.6 },
      { mes: "Jul", valor: 0.31 },
      { mes: "Ago", valor: 0.15 },
    ],
  },
  {
    id: "PDCA-2026-021",
    titulo: "Reducción de retrabajos en despliegues del portal de becarios",
    area: "Ingeniería de Software",
    fase: "Do",
    actualizado: "23 Ago 2026",
    progreso: 38,
    problema:
      "El 30% de los despliegues del portal requieren hotfix dentro de las primeras 24 horas.",
    causa_raiz:
      "No hay ambiente de staging con datos representativos ni pruebas automatizadas de regresión en el flujo de captura.",
    acciones: [
      {
        id: "e1",
        what: "Provisionar staging con dataset anonimizado",
        who: "Diego Fuentes",
        when: "15 Ago 2026",
        status: "Completada",
        done: true,
      },
      {
        id: "e2",
        what: "Cubrir con pruebas E2E los 5 flujos críticos",
        who: "Ana López",
        when: "02 Sep 2026",
        status: "En progreso",
        done: false,
      },
      {
        id: "e3",
        what: "Definir checklist de release y responsable de guardia",
        who: "Sofía Naranjo",
        when: "09 Sep 2026",
        status: "Pendiente",
        done: false,
      },
    ],
    verificacion: "",
    evidencias: ["cobertura_e2e_parcial.png"],
    estandarizacion: "",
    indicador: {
      etiqueta: "Despliegues con hotfix",
      antes: 30,
      despues: 30,
      unidad: "%",
    },
    serie: [
      { mes: "May", valor: 32 },
      { mes: "Jun", valor: 31 },
      { mes: "Jul", valor: 30 },
      { mes: "Ago", valor: 30 },
    ],
  },
];
