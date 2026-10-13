import { createRda } from "@/services/rda-service";
import type { Rda } from "@/data/rda";

const newRda: Rda = {
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
    area: "Bloque Frío",
    fechaLimite: "2026-10-10",
    autorOriginal: "Iván Rojero",
    autorEmail: "",
    usuariosAsignados: ["Iván Rojero"],
    descripcionProblema: "DQO fuera de especificación, se tienen valores promedio de 15,000 mg/lt, En el mes de septiembre, en bloque frío.",
  },
  context: {
    planta: "ZACATECAS",
    fecha: "2026-09-01",
    turno: "",
    iniciadoPor: "Iván Rojero",
    responsable: "Iván Rojero",
    etapa: "Bloque Frío",
    departamento: "",
    area: "",
    disparador: "",
    equiposAfectados: "",
    folio: "RDA_2026_19",
    tiempoParo: "",
    unidadesTiempoParo: "",
    perdidas: "",
    unidadesPerdidas: "",
    productosNoConformes: "",
    unidadesNoConformes: "",
  },
  problemDescription: {
    que: "DQO fuera de especificación",
    como: "se tienen valores promedio de 15,000 mg/lt",
    cuando: "En el mes de septiembre",
    donde: "en bloque frío",
    quien: "",
    cual: "",
  },
  immediateActions: [],
  observacionesAdicionales: "",
  timeline: [],
  analizadoEnOtrosReportes: "No",
  participantesRC: "Iván Rojero",
  ishikawa: [
    { id: "1", category: "Mano de Obra", text: "Exceso de despunte al arranque de filtro" },
    { id: "2", category: "Mano de Obra", text: "Alto volumen en el tanque de despuntes al arranque del filtro" },
    { id: "3", category: "Método", text: "Bajos ciclos de filtración" },
    { id: "4", category: "Mano de Obra", text: "No se supervisan las extracciones de levadura" },
    { id: "5", category: "Maquinaria", text: "Enjuague de línea de inóculo al drenaje" },
    { id: "6", category: "Maquinaria", text: "Programación de enjuague final en CMF" },
    { id: "7", category: "Medición", text: "Equipo de turbidez de línea de levadura descalibrados" },
    { id: "8", category: "Mano de Obra", text: "Mal purgado de levadura en inicio de extracciones" },
    { id: "9", category: "Máquina", text: "Válvulas de descarga de tierra agotada de filtros fugan" },
    { id: "10", category: "Maquinaria", text: "Sensores de nivel alto de trompo de TA no activan" },
    { id: "11", category: "Maquinaria", text: "Mala programación en trompo de TA f9 y 10" },
    { id: "12", category: "Maquinaria", text: "Enjuague al final del ciclo de filtro de tierra" },
    { id: "13", category: "Material", text: "Derrames de tierra en bodega de tierras" },
    { id: "14", category: "Mano de Obra", text: "No se realiza la descarga de filtros de tierra de manera controlada" },
    { id: "15", category: "Mano de Obra", text: "No se supervisa la colocación del carro tolva" }
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
      accion: "Verificar si al presentarse ciclo de filtración bajo se tienen los despuntes llenos",
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
      accion: "Revisar si al final del inoculo se esta utilizando la linea de enjuague para recuperar a tanques de levadura.",
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
      accion: "Revisar la cadena del filtro para descartar que en el paso de enjuague de tuberia de tierra este realizando purga de tierra al dren",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    },
    {
      id: "val_11",
      categoria: "MANO DE OBRA",
      causaPotencial: "No se realiza la descarga de filtros de tierra de manera controlada",
      accion: "Verificar si al empalmarse dos filtros para enviar tierra se esta verificando nivel de trompos antes de enviar para evitar derrames",
      responsable: "Iván Rojero",
      fechaLimite: "2026-10-10",
      estatus: "Completa",
      esCausaRaiz: "SI"
    },
    {
      id: "val_12",
      categoria: "MANO DE OBRA",
      causaPotencial: "No se supervisa la colocacion del carro tolva",
      accion: "Validar que los supervisores estan validando que la tolva se encuentra colocada, bien posicionada y con la boya en su lugar",
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
  }
};

let injected = false;
export function seedRda19(rdas: Rda[]) {
  if (injected) return;
  if (rdas.length > 0 && !rdas.find(r => r.id === "RDA_2026_19")) {
    injected = true;
    createRda(newRda).then(() => {
      console.log("RDA 19 Injected");
    }).catch(e => console.error("Error injecting", e));
  }
}
