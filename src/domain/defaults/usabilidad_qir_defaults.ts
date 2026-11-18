/**
 * Reportes Oficiales de Incidente de Proceso (QIR) extraídos de las hojas de histórico oficial de planta.
 */
import type { ResumenReporteIncidente } from "../models/usabilidad/usabilidad_types";

export const REPORTES_INCIDENTES_OFICIALES: ResumenReporteIncidente[] = [
  {
    id: "inc-cfr-2025",
    titulo_hoja: "Último Incidente Cuartos Fríos (CFR)",
    planta_ubicacion: "Zacatecas / México / MAZ",
    contacto_responsable: "Axel Guillén Ramírez",
    nivel_severidad: "Significante",
    fecha_ocurrencia: "26 de julio del 2025",
    marca_afectada: "Corona",
    fecha_reporte: "09 de septiembre del 2025",
    volumen_no_conforme:
      "46 cajas (25 cajas reportadas con mezcla de cerveza Victoria en lote Corona L9)",
    condicion_conductora: "Error operativo (humano)",
    detalles_incidente:
      "Se recibe queja de cliente donde se reportan 25 cajas de cerveza Corona con color más oscuro (similar a Victoria), envasada el 26 de julio del 2025 en línea 9 (lote LG265098 12:15). Se presentó mezcla de cerveza al no cargar correctamente un tramo de tubería durante el cambio de tanque del 7 al 85.",
    causas_principales:
      "Al hacer el cambio de marca de Victoria a Corona en línea 9 quedó cargado un tramo de tubería con ~10 HL de cerveza Victoria y al volver a utilizar el tramo se envió hacia llenadoras de línea 9.",
    acciones_preventivas:
      "1. Crear layout para llenado de tanques de gobierno con tanques dedicados sin uso de puentes/conectores.\n2. Implementar registro de tuberías utilizadas para vaciado de BBT hacia envasado.\n3. Implementar registro donde se especifique el estatus del cargado de las tuberías de gobierno.",
  },
  {
    id: "inc-coctos-2025",
    titulo_hoja: "Último Incidente Cocimientos",
    planta_ubicacion: "Zacatecas / México / MAZ",
    contacto_responsable: "Axel Guillén Ramírez",
    nivel_severidad: "Significante",
    fecha_ocurrencia: "27 - 28 de febrero del 2025",
    marca_afectada: "NA",
    fecha_reporte: "Febrero 2025",
    volumen_no_conforme: "> 50 HL mosto/proceso afectado",
    condicion_conductora: "Instalación o mantenimiento de equipos (tecnología)",
    detalles_incidente:
      "Incidente de proceso registrado en el área de Cocimientos asociado a condición técnica de equipos e instrumentación crítica de proceso.",
    causas_principales:
      "Desviación en condición operativa de componente electromecánico / instrumentación en tren de cocimientos.",
    acciones_preventivas:
      "1. Verificación modular preventiva en equipos críticos de cocimientos.\n2. Actualización de matriz SDCA (Checklist y Plan de Reacción).",
  },
  {
    id: "inc-coctos-penult-2023",
    titulo_hoja: "Penúltimo Incidente de Proceso Cocimientos",
    planta_ubicacion: "Zacatecas / México / MAZ",
    contacto_responsable: "Axel Guillén Ramírez",
    nivel_severidad: "Significante",
    fecha_ocurrencia: "23 de agosto del 2023",
    marca_afectada: "Victoria",
    fecha_reporte: "24 de agosto del 2023",
    volumen_no_conforme: "600 HL Cocto 6088 Victoria",
    condicion_conductora: "Instalación o mantenimiento de equipos (tecnología)",
    detalles_incidente:
      "Durante la filtración del cocimiento Victoria 6088 por el Filtro Lauter 4, al llevar 383 HL filtrados la compuerta 24/612M07 de la TAB 8 marcó falla al cerrar desde las 12:12:56 hasta las 12:20:55, observándose escurrimiento del primer mosto.",
    causas_principales:
      "1. La compuerta no cerró completamente durante el desalojo de bagazo anterior.\n2. Falla electrónica que mandó señal de abierto/falla en tarjeta electrónica.",
    acciones_preventivas:
      "1. Revisar hermeticidad de compuertas antes de recibir el macerador.\n2. Monitorear cámaras de tolvas de bagazo.\n3. Revisar conexiones en peinetas de tarjetas electrónicas y realizar prueba en vacío.\n4. Programar enclavamiento lógico para impedir recibir el siguiente macerado si la compuerta no cierra físicamente.",
  },
];
