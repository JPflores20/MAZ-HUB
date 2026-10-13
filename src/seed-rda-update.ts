/**
 * seed-rda-update.ts
 * Script de actualización masiva y normalización de registros de prueba del módulo RDA en Firestore.
 */
import { createRda } from "@/services/rda-service";
import type { Rda } from "@/data/rda";

const updatedRda: Rda = {
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
    descripcionProblema: "DQO fuera de especificación, se tienen valores promedio de 15,000 mg/lt, En el mes de septiembre, en bloque frío.",
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
      esCausaRaiz: "NO"
    },
    {
      id: "imm_2",
      categoria: "METODO",
      causaPotencial: "Inmediata",
      accion: "2.- Se realiza plan de acción para mitigar impactos a BTS",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-09",
      estatus: "Completa",
      esCausaRaiz: "NO"
    },
    {
      id: "imm_3",
      categoria: "MANO DE OBRA",
      causaPotencial: "Inmediata",
      accion: "3.- Se realizan platicas informativas a personal de primera línea para concientizar impacto a BTS",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-09",
      estatus: "Completa",
      esCausaRaiz: "NO"
    }
  ],
  observacionesAdicionales: "Durante el més de septiembre se tienen valores promedio de 15,000 mg/ml por lo que se realiza plan para reducir las descargas de levadura, cerveza y tierra agotada.",
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
          "Bajos ciclos de filtración (Metodo)"
        ],
        method: [
          "1.-No se supervisan las extracciones de levadura en el área (Hombre)",
          "2.-Enjuague de linea de inoculo al drenaje (Maquinaria)",
          "3.- Programación de enjuague final en CMF (Maquinaria)",
          "4.- Equipo de turbidez de línea de levadura descalibrados (medición)",
          "5. Mal purgado de levadura en inicio de extracciones (mano de obra)"
        ],
        material: [
          "1.-Valvulas de descarga de tierra agotada de filtros fugan (Maquina)",
          "2.-Sensores de nivel alto de trompo de TA no activan (Maquinaria)",
          "3.-Mala programación en trompo de TA f9y10 (Maquinaria)",
          "4.-Enjuague al final del ciclo de filtro de tierra (Maquinaria)",
          "5.- Derrames de tierra en bodega de tierras",
          "6.-No se realiza la descarga de filtros de tierra de manera controlada (Hombre)",
          "7.-No se supervisa la colocación del carro tolva (Hombre)"
        ],
        manpower: [""],
        measurement: [""],
        environment: [""]
      },
      prioritizedCauses: [],
      customLabels: {
        machine: "Cerveza",
        method: "Levadura",
        material: "Tierra",
        manpower: "Medición",
        measurement: "Material"
      }
    }
  ],
  validationActions: [
    {
      id: "val_1",
      categoria: "MANO DE OBRA",
      causaPotencial: "Exceso de despunte al arranque de filtro",
      accion: "Revisar protocolo de pasoso para verificar que se respete el volumen programado de despunte",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    },
    {
      id: "val_2",
      categoria: "MANO DE OBRA",
      causaPotencial: "Alto volumen en el tanque de despuntes al arranque del filtro",
      accion: "Revisar los volumenes de los tanques de despuntes para verificar si terminan llenos.",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    },
    {
      id: "val_3",
      categoria: "METODO",
      causaPotencial: "Bajos ciclos de filtración",
      accion: "Verificar si al presentarse ciclo de filtración bajo se tienen los despuentes llenos",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "NO"
    },
    {
      id: "val_4",
      categoria: "MANO DE OBRA",
      causaPotencial: "No se supervisan las extracciones de levadura en el área",
      accion: "Revisar si al realizar las extracciones de levadura en algun momento se realiza purga al drenaje",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-15",
      estatus: "En progreso",
      esCausaRaiz: "Pendiente"
    },
    {
      id: "val_5",
      categoria: "MAQUINA",
      causaPotencial: "Enjuague de linea de inoculo al drenaje",
      accion: "Revisar si al final del inoculo se esta utilizando la línea de enjuague para recuperar a tanques de levadura.",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "NO"
    },
    {
      id: "val_6",
      categoria: "MAQUINA",
      causaPotencial: "Programación de enjuague final en CMF",
      accion: "Revisar si al final del ciclo del CMF realiza drenaje a la canaleta y si la solución contiene levadura",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-13",
      estatus: "En progreso",
      esCausaRaiz: "Pendiente"
    },
    {
      id: "val_7",
      categoria: "MAQUINA",
      causaPotencial: "Valvulas de descarga de tierra agotada de filtros fugan",
      accion: "Validar hermeticidad de valvulas de tierra agotada de filtros 1-8 revisando en el paso de enviar tierra que no se tenga flujo por la chismosa",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-15",
      estatus: "En progreso",
      esCausaRaiz: "Pendiente"
    },
    {
      id: "val_8",
      categoria: "MAQUINA",
      causaPotencial: "Sensores de nivel alto de trompo de TA no activan",
      accion: "Validar funcionamiento de sensor de nivel alto de trompo de tierra agotada de filtro 9 y 10.",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "NO"
    },
    {
      id: "val_9",
      categoria: "MAQUINA",
      causaPotencial: "Mala programación en trompo de TA f9y10",
      accion: "Revisar el paso de decantar en los trompos de tierra agotada de filtros 9 y 10 para verificar que no se tenga descarga de tierra al drenaje",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    },
    {
      id: "val_10",
      categoria: "MAQUINA",
      causaPotencial: "Enjuague al final del ciclo de filtro de tierra",
      accion: "Revisar la cadena del filtro para descartar que en el paso de enjuague de tuberia de tierra esté realizando purga de tierra al dren",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    },
    {
      id: "val_11",
      categoria: "MANO DE OBRA",
      causaPotencial: "No se realiza la descarga de filtros de tierra de manera controlada",
      accion: "Verificar si al empalmarse dos filtros para enviar tierra se esta verificando nivel de trompos antes de enviar para evitar derrames de tierra por sobre llenado de trompos",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    },
    {
      id: "val_12",
      categoria: "MANO DE OBRA",
      causaPotencial: "No se supervisa la colocación del carro tolva",
      accion: "Validar que los supervisres estan validando que la tolva se encuentra colocada, bien posicionada y con la boya en su lugar",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    }
  ],
  checklistEstandarizacion: {
    actualizacionMapeo: false,
    realizarOvd: false,
    actualizacionSop: false,
    cambiosCapacitacion: false,
    monitoreoIp: false
  },
  pda: []
};

let injected = false;
export function seedRdaUpdate() {
  if (injected) return;
  injected = true;
  createRda(updatedRda).then(() => {
    console.log("RDA 19 Updated");
  }).catch(e => console.error("Error injecting", e));
}
