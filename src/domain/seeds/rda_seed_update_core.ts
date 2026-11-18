/**
 * Datos actualizados de portada, contexto, acciones inmediatas e Ishikawa para la actualización de `RDA_2026_19`.
 */
import type { Rda } from "../models/rda";

/** Cuerpo principal actualizado para normalizar el caso `RDA_2026_19` en Firestore. */
export const RDA_SEED_UPDATE_BASE: Omit<
  Rda,
  "validationActions" | "checklistEstandarizacion" | "pda"
> = {
  id: "RDA_2026_19",
  title: "DQO fuera de especificación",
  status: "Abierto",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  completedPhases: [],
  completedSteps: [],
  naSteps: [],
  portada: {
    titulo: "DQO fuera de especificación",
    area: "Bloque frío",
    fechaLimite: "2026-10-15",
    autorOriginal: "Iván Rojero",
    autorEmail: "",
    usuariosAsignados: ["Iván Rojero", "Claudia Alvarez"],
    descripcionProblema:
      "DQO fuera de especificación, se tienen valores promedio de 15,000 mg/lt, En el mes de septiembre, en bloque frío.",
  },
  context: {
    planta: "ZACATECAS",
    fecha: "2026-10-09",
    turno: "2",
    iniciadoPor: "Iván Rojero",
    responsable: "Claudia Alvarez",
    etapa: "Mosto Frío",
    departamento: "Elaboracion",
    area: "Bloque frío",
    disparador: "DQO",
    equiposAfectados: "",
    folio: "RDA_2026_19",
    tiempoParo: "",
    unidadesTiempoParo: "",
    perdidas: "16",
    unidadesPerdidas: "coctos",
    productosNoConformes: "0",
    unidadesNoConformes: "0",
  },
  problemDescription: {
    que: "DQO fuera de especificación",
    como: "se tienen valores promedio de 15,000 mg/lt",
    cuando: "En el mes de septiembre",
    donde: "en bloque frío",
    quien: "",
    cual: "",
  },
  immediateActions: [
    {
      id: "imm_1",
      categoria: "METODO",
      causaPotencial: "Inmediata",
      accion: "1- Se identifican principales fuentes donde ocurren descargas a BTS",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-09",
      estatus: "Completa",
      esCausaRaiz: "NO",
    },
    {
      id: "imm_2",
      categoria: "METODO",
      causaPotencial: "Inmediata",
      accion: "2.- Se realiza plan de acción para mitigar impactos a BTS",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-09",
      estatus: "Completa",
      esCausaRaiz: "NO",
    },
    {
      id: "imm_3",
      categoria: "MANO DE OBRA",
      causaPotencial: "Inmediata",
      accion:
        "3.- Se realizan platicas informativas a personal de primera línea para concientizar impacto a BTS",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-09",
      estatus: "Completa",
      esCausaRaiz: "NO",
    },
  ],
  observacionesAdicionales:
    "Durante el més de septiembre se tienen valores promedio de 15,000 mg/ml por lo que se realiza plan para reducir las descargas de levadura, cerveza y tierra agotada.",
  timeline: [],
  analizadoEnOtrosReportes: "No",
  participantesRC: "Iván Rojero",
  ishikawa: [
    {
      id: "ishikawa-0",
      title: "Problema Principal",
      effect: "DQO fuera de especificación",
      causes: {
        machine: [
          "Exceso de despunte al arranque de filtro (M. Obra)",
          "Alto volumen en el tanque de despuntes al arranque del filtro (M. Obra)",
          "Bajos ciclos de filtración (Metodo)",
        ],
        method: [
          "1.-No se supervisan las extracciones de levadura en el área (Hombre)",
          "2.-Enjuague de linea de inoculo al drenaje (Maquinaria)",
          "3.- Programación de enjuague final en CMF (Maquinaria)",
          "4.- Equipo de turbidez de línea de levadura descalibrados (medición)",
          "5. Mal purgado de levadura en inicio de extracciones (mano de obra)",
        ],
        material: [
          "1.-Valvulas de descarga de tierra agotada de filtros fugan (Maquina)",
          "2.-Sensores de nivel alto de trompo de TA no activan (Maquinaria)",
          "3.-Mala programación en trompo de TA f9y10 (Maquinaria)",
          "4.-Enjuague al final del ciclo de filtro de tierra (Maquinaria)",
          "5.- Derrames de tierra en bodega de tierras",
          "6.-No se realiza la descarga de filtros de tierra de manera controlada (Hombre)",
          "7.-No se supervisa la colocación del carro tolva (Hombre)",
        ],
        manpower: [""],
        measurement: [""],
        environment: [""],
      },
      prioritizedCauses: [],
      customLabels: {
        machine: "Cerveza",
        method: "Levadura",
        material: "Tierra",
        manpower: "Medición",
        measurement: "Material",
      },
    },
  ],
};
