/**
 * Acciones de validación de causa raíz y checklist para el script de actualización de `RDA_2026_19`.
 */
import type { RdaValidationAction } from "../models/rda";

/** Lista completa de acciones de validación actualizadas para `RDA_2026_19`. */
export const RDA_SEED_UPDATE_VALIDATION_ACTIONS: RdaValidationAction[] = [
  {
    id: "val_1",
    categoria: "MANO DE OBRA",
    causaPotencial: "Exceso de despunte al arranque de filtro",
    accion:
      "Revisar protocolo de pasoso para verificar que se respete el volumen programado de despunte",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "SI",
  },
  {
    id: "val_2",
    categoria: "MANO DE OBRA",
    causaPotencial: "Alto volumen en el tanque de despuntes al arranque del filtro",
    accion: "Revisar los volumenes de los tanques de despuntes para verificar si terminan llenos.",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "SI",
  },
  {
    id: "val_3",
    categoria: "METODO",
    causaPotencial: "Bajos ciclos de filtración",
    accion: "Verificar si al presentarse ciclo de filtración bajo se tienen los despuentes llenos",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "NO",
  },
  {
    id: "val_4",
    categoria: "MANO DE OBRA",
    causaPotencial: "No se supervisan las extracciones de levadura en el área",
    accion:
      "Revisar si al realizar las extracciones de levadura en algun momento se realiza purga al drenaje",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-15",
    estatus: "En progreso",
    esCausaRaiz: "Pendiente",
  },
  {
    id: "val_5",
    categoria: "MAQUINA",
    causaPotencial: "Enjuague de linea de inoculo al drenaje",
    accion:
      "Revisar si al final del inoculo se esta utilizando la línea de enjuague para recuperar a tanques de levadura.",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "NO",
  },
  {
    id: "val_6",
    categoria: "MAQUINA",
    causaPotencial: "Programación de enjuague final en CMF",
    accion:
      "Revisar si al final del ciclo del CMF realiza drenaje a la canaleta y si la solución contiene levadura",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-13",
    estatus: "En progreso",
    esCausaRaiz: "Pendiente",
  },
  {
    id: "val_7",
    categoria: "MAQUINA",
    causaPotencial: "Valvulas de descarga de tierra agotada de filtros fugan",
    accion:
      "Validar hermeticidad de valvulas de tierra agotada de filtros 1-8 revisando en el paso de enviar tierra que no se tenga flujo por la chismosa",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-15",
    estatus: "En progreso",
    esCausaRaiz: "Pendiente",
  },
  {
    id: "val_8",
    categoria: "MAQUINA",
    causaPotencial: "Sensores de nivel alto de trompo de TA no activan",
    accion: "Validar funcionamiento de sensor de nivel alto de trompo de tierra agotada de filtro 9 y 10.",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "NO",
  },
  {
    id: "val_9",
    categoria: "MAQUINA",
    causaPotencial: "Mala programación en trompo de TA f9y10",
    accion:
      "Revisar el paso de decantar en los trompos de tierra agotada de filtros 9 y 10 para verificar que no se tenga descarga de tierra al drenaje",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "SI",
  },
  {
    id: "val_10",
    categoria: "MAQUINA",
    causaPotencial: "Enjuague al final del ciclo de filtro de tierra",
    accion:
      "Revisar la cadena del filtro para descartar que en el paso de enjuague de tuberia de tierra esté realizando purga de tierra al dren",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "SI",
  },
  {
    id: "val_11",
    categoria: "MANO DE OBRA",
    causaPotencial: "No se realiza la descarga de filtros de tierra de manera controlada",
    accion:
      "Verificar si al empalmarse dos filtros para enviar tierra se esta verificando nivel de trompos antes de enviar para evitar derrames de tierra por sobre llenado de trompos",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "SI",
  },
  {
    id: "val_12",
    categoria: "MANO DE OBRA",
    causaPotencial: "No se supervisa la colocación del carro tolva",
    accion:
      "Validar que los supervisres estan validando que la tolva se encuentra colocada, bien posicionada y con la boya en su lugar",
    responsable: "Iván Rojero",
    fechaLimite: "2026-10-10",
    estatus: "Completa",
    esCausaRaiz: "SI",
  },
];
