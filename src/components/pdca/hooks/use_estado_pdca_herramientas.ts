import { useState } from "react";
import type {
  Pdca,
  FiveWhysTableData,
  ImpactMatrixRow,
  IshikawaItem,
  ActionItem,
} from "@/data/pdca";

export const use_estado_pdca_herramientas = (pdcaInicial: Pdca) => {
  const [tablasCincoPorques, setTablasCincoPorques] = useState<FiveWhysTableData[]>(() => {
    const rawTablesObj = pdcaInicial.fiveWhysTables || (pdcaInicial as any).five_whys_tables;
    console.log(
      "DEBUG_PDCA: fiveWhys:",
      (pdcaInicial as any).five_whys,
      "fiveWhysTables:",
      pdcaInicial.fiveWhysTables,
    );
    const rawTables = Array.isArray(rawTablesObj)
      ? rawTablesObj
      : rawTablesObj && typeof rawTablesObj === "object"
        ? Object.values(rawTablesObj)
        : null;

    if (rawTables && rawTables.length > 0) {
      return rawTables.map((table: any) => {
        let rawRows = table.rows || table.data;
        if (typeof rawRows === "string") {
          try {
            rawRows = JSON.parse(rawRows);
          } catch (e) {}
        }
        let mappedRows = [];

        if (Array.isArray(rawRows)) {
          mappedRows = rawRows;
        } else if (rawRows && typeof rawRows === "object") {
          if (rawRows.why1 !== undefined || rawRows.q1 !== undefined) {
            mappedRows = [rawRows];
          } else {
            mappedRows = Object.values(rawRows);
          }
        }

        if (mappedRows.length === 0) {
          const numericKeys = Object.keys(table).filter((k) => !isNaN(Number(k)) && k !== "length");
          if (numericKeys.length > 0) {
            mappedRows = numericKeys.map((k) => table[k]);
          } else if (table.why1 !== undefined || table.q1 !== undefined) {
            mappedRows = [table];
          }
        }

        if (mappedRows.length === 0) {
          mappedRows = Array.from({ length: 5 }).map((_, i) => ({
            id: Date.now() + i,
            q1: "",
            q2: "",
            q3: "",
            q4: "",
            q5: "",
            w1: "",
            w2: "",
            w3: "",
            w4: "",
            w5: "",
            accion: "",
            isRootCause: "",
          }));
        } else {
          mappedRows = mappedRows.map((row: any) => {
            return {
              id: row.id || Date.now() + Math.random(),
              q1: row.q1 !== undefined ? row.q1 : row.why1 || "",
              q2: row.q2 !== undefined ? row.q2 : row.why2 || "",
              q3: row.q3 !== undefined ? row.q3 : row.why3 || "",
              q4: row.q4 !== undefined ? row.q4 : row.why4 || "",
              q5: row.q5 !== undefined ? row.q5 : row.why5 || "",
              w1: row.w1 || "",
              w2: row.w2 || "",
              w3: row.w3 || "",
              w4: row.w4 || "",
              w5: row.w5 || "",
              isRootCause:
                row.isRootCause !== undefined
                  ? row.isRootCause
                  : row.rootCause === "Sí" || row.rootCause === "S" || row.rootCause === "Si"
                    ? "Sí"
                    : row.rootCause === "No"
                      ? "No"
                      : "",
              accion: row.accion !== undefined ? row.accion : row.effect || "",
              evidencia: row.evidencia || "",
            };
          });
        }

        return {
          ...table,
          rows: mappedRows,
        };
      });
    }
    return [
      {
        id: "fivewhys-1",
        title: "MÉTODO",
        rows: [
          {
            id: Date.now(),
            q1: "",
            q2: "",
            q3: "",
            q4: "",
            q5: "",
            w1: "",
            w2: "",
            w3: "",
            w4: "",
            w5: "",
            accion: "",
          },
        ],
      },
    ];
  });

  const [matrizImpacto, setMatrizImpacto] = useState<ImpactMatrixRow[]>(
    pdcaInicial.impactMatrix || [],
  );

  const [ishikawasGenerales, setIshikawasGenerales] = useState<IshikawaItem[]>(() => {
    const rawIshObj = pdcaInicial.ishikawas;
    const rawIshikawas = Array.isArray(rawIshObj)
      ? rawIshObj
      : rawIshObj && typeof rawIshObj === "object"
        ? Object.values(rawIshObj)
        : null;

    const normalizeCauses = (causes: any) => {
      if (typeof causes === "string") {
        try {
          causes = JSON.parse(causes);
        } catch (e) {}
      }
      const result = {
        machine: [] as string[],
        method: [] as string[],
        material: [] as string[],
        manpower: [] as string[],
        measurement: [] as string[],
        environment: [] as string[],
      };
      if (!causes || typeof causes !== "object") return result;

      for (const [key, val] of Object.entries(causes)) {
        if (!Array.isArray(val)) continue;
        const k = key.toLowerCase();
        if (k.includes("m\u00E1quina") || k.includes("maquina") || k.includes("machine"))
          result.machine.push(...val);
        else if (k.includes("m\u00E9todo") || k.includes("metodo") || k.includes("method"))
          result.method.push(...val);
        else if (k.includes("material")) result.material.push(...val);
        else if (k.includes("mano") || k.includes("obra") || k.includes("manpower"))
          result.manpower.push(...val);
        else if (k.includes("medici\u00F3n") || k.includes("medicion") || k.includes("measurement"))
          result.measurement.push(...val);
        else if (k.includes("medio") || k.includes("ambiente") || k.includes("environment"))
          result.environment.push(...val);
        else {
          result.machine.push(...val);
        }
      }
      return result;
    };

    if (rawIshikawas && rawIshikawas.length > 0) {
      return rawIshikawas.map((ish: any) => ({
        ...ish,
        causes: normalizeCauses(ish.causes),
        prioritization:
          typeof ish.prioritization === "string"
            ? (() => {
                try {
                  return JSON.parse(ish.prioritization);
                } catch (e) {
                  return [];
                }
              })()
            : ish.prioritization || [],
      }));
    }

    const legacyCauses = pdcaInicial.ishikawaCauses || (pdcaInicial as any).ishikawa_causes;
    if (legacyCauses) {
      return [
        {
          id: "ishikawa-1",
          title: "Análisis de Causa",
          effect:
            pdcaInicial.ishikawaEffect ||
            (pdcaInicial as any).ishikawa_effect ||
            "Efecto / Problema",
          prioritization: (() => {
            const p =
              pdcaInicial.prioritizationCauses || (pdcaInicial as any).prioritization_causes;
            if (typeof p === "string") {
              try {
                return JSON.parse(p);
              } catch (e) {
                return [];
              }
            }
            return p || [];
          })(),
          prioritizationCustomCriterion:
            (pdcaInicial as any).prioritizationCustomCriterion ||
            (pdcaInicial as any).prioritization_custom_criterion ||
            "",
          customLabels:
            pdcaInicial.ishikawaConceptos || (pdcaInicial as any).ishikawa_conceptos || {},
          causes: normalizeCauses(legacyCauses),
        },
      ];
    }

    return [
      {
        id: "ishikawa-1",
        title: "Análisis de Causa",
        effect: "Efecto / Problema",
        causes: {
          machine: [],
          method: [],
          material: [],
          manpower: [],
          measurement: [],
          environment: [],
        },
        prioritization: [],
      },
    ];
  });

  const [conceptosIshikawa, setConceptosIshikawa] = useState<Record<string, string>>(
    pdcaInicial.ishikawaConceptos || pdcaInicial.ishikawa_conceptos || {},
  );

  const [elementosAccion, setElementosAccion] = useState<ActionItem[]>(pdcaInicial.acciones || []);

  const [tieneCorrelacionSabor, setTieneCorrelacionSabor] = useState<boolean>(
    pdcaInicial.hasFlavorCorrelation || false,
  );
  const [datosCorrelacionSabor, setDatosCorrelacionSabor] = useState<any>(
    pdcaInicial.flavorCorrelationData || null,
  );

  const [tieneTemasGop, setTieneTemasGop] = useState<boolean>(
    pdcaInicial.hasGopThemes ?? (pdcaInicial as any).has_gop_themes ?? false,
  );
  const [datosTemasGop, setDatosTemasGop] = useState<any[]>(() => {
    const rawGopObj =
      pdcaInicial.gopThemesData ||
      (pdcaInicial as any).gop_themes_data ||
      (pdcaInicial as any).gopThemes ||
      (pdcaInicial as any).gop_themes ||
      (pdcaInicial as any).temasGop ||
      (pdcaInicial as any).temas_gop ||
      (pdcaInicial as any).gopThemesSection ||
      (pdcaInicial as any).gops ||
      (pdcaInicial as any).gop ||
      (pdcaInicial as any).temas;

    let rawRows: any[] = [];
    if (typeof rawGopObj === "string") {
      try {
        rawRows = JSON.parse(rawGopObj);
      } catch (e) {
        rawRows = [];
      }
    } else if (Array.isArray(rawGopObj)) {
      rawRows = rawGopObj;
    } else if (rawGopObj && typeof rawGopObj === "object") {
      rawRows = Object.values(rawGopObj);
    }

    if (rawRows.length > 0) {
      return rawRows.map((row: any, idx: number) => {
        const rawMeses = row.meses || row.months || row.mesesColumns || row.meses_columns;
        let meses = Array(12).fill(false);
        if (Array.isArray(rawMeses)) {
          meses = rawMeses.map((m: any) => Boolean(m));
        } else if (rawMeses && typeof rawMeses === "object") {
          meses = Array.from({ length: 12 }, (_, i) => Boolean(rawMeses[i]));
        }

        const rawMesesValues = row.mesesValues || row.meses_values || row.mesesValores;
        let mesesValues = Array(12).fill("100%");
        if (Array.isArray(rawMesesValues)) {
          mesesValues = Array.from({ length: 12 }, (_, i) =>
            rawMesesValues[i] !== undefined && rawMesesValues[i] !== null
              ? String(rawMesesValues[i])
              : "100%",
          );
        } else if (rawMesesValues && typeof rawMesesValues === "object") {
          mesesValues = Array.from({ length: 12 }, (_, i) =>
            rawMesesValues[i] !== undefined && rawMesesValues[i] !== null
              ? String(rawMesesValues[i])
              : "100%",
          );
        }

        const rawMesesColors = row.mesesColors || row.meses_colors || row.mesesColores;
        let mesesColors = Array(12).fill("red");
        if (Array.isArray(rawMesesColors)) {
          mesesColors = Array.from({ length: 12 }, (_, i) => rawMesesColors[i] || "red");
        } else if (rawMesesColors && typeof rawMesesColors === "object") {
          mesesColors = Array.from({ length: 12 }, (_, i) => rawMesesColors[i] || "red");
        }

        return {
          id: row.id || Date.now() + idx,
          tema: row.tema || row.nombre || row.topic || row.theme || "",
          meses,
          mesesValues,
          mesesColors,
          fechaCompromiso:
            row.fechaCompromiso ||
            row.fecha_compromiso ||
            row.fecha ||
            row.commitmentDate ||
            row.commitment_date ||
            "",
          porcentajeAvance:
            row.porcentajeAvance !== undefined && row.porcentajeAvance !== null
              ? String(row.porcentajeAvance)
              : row.porcentaje_avance !== undefined && row.porcentaje_avance !== null
                ? String(row.porcentaje_avance)
                : row.avance !== undefined && row.avance !== null
                  ? String(row.avance)
                  : "",
          focusItems:
            row.focusItems !== undefined && row.focusItems !== null
              ? String(row.focusItems)
              : row.focus_items !== undefined && row.focus_items !== null
                ? String(row.focus_items)
                : row.items !== undefined && row.items !== null
                  ? String(row.items)
                  : "",
          focusType: row.focusType || row.focus_type || row.tipo || "#",
          status: row.status || row.estado || row.estatus || "",
        };
      });
    }

    return [];
  });

  const [archivosMapeoProcesos, setArchivosMapeoProcesos] = useState<string[]>(
    pdcaInicial.processMappingFiles ||
      (pdcaInicial.processMappingImage ? [pdcaInicial.processMappingImage] : []),
  );
  const [tieneMapeoProcesos, setTieneMapeoProcesos] = useState<boolean>(
    pdcaInicial.hasMapeoProceso ?? pdcaInicial.has_mapeo_proceso ?? false,
  );
  const [imagenMapeoProceso, setImagenMapeoProceso] = useState<string | undefined>(
    pdcaInicial.mapeoProcesoImage || pdcaInicial.mapeo_proceso_image,
  );
  const [descripcionMapeoProceso, setDescripcionMapeoProceso] = useState<string | undefined>(
    pdcaInicial.mapeoProcesoDesc || pdcaInicial.mapeo_proceso_desc,
  );

  const [archivosMapaSipoc, setArchivosMapaSipoc] = useState<string[]>(
    pdcaInicial.sipocMapFiles || pdcaInicial.sipoc_map_files || [],
  );

  const [datosColeccion, setDatosColeccion] = useState<any[]>(
    pdcaInicial.coleccionDatos || pdcaInicial.coleccion_datos || [],
  );

  const [textoEspecificacionProcesos, setTextoEspecificacionProcesos] = useState<
    string | undefined
  >(pdcaInicial.especificacionProcesosText || pdcaInicial.especificacion_procesos_text);
  const [imagenEspecificacionProcesos, setImagenEspecificacionProcesos] = useState<
    string | undefined
  >(pdcaInicial.especificacionProcesosImage || pdcaInicial.especificacion_procesos_image);

  const [datosVozConsumidor, setDatosVozConsumidor] = useState<any[]>(
    pdcaInicial.vozConsumidor || pdcaInicial.voz_consumidor || [],
  );

  const [riesgosProyectoAnalizados, setRiesgosProyectoAnalizados] = useState<any[]>(
    pdcaInicial.analisisRiesgosProyecto || pdcaInicial.analisis_riesgos_proyecto || [],
  );
  const [riesgosEstandarizacionAnalizados, setRiesgosEstandarizacionAnalizados] = useState<any[]>(
    pdcaInicial.analisisRiesgosEstandarizacion ||
      pdcaInicial.analisis_riesgos_estandarizacion ||
      [],
  );

  const [conclusionesCausaRaizEncontradas, setConclusionesCausaRaizEncontradas] = useState<any[]>(
    pdcaInicial.conclusionesCausaRaiz || pdcaInicial.conclusiones_causa_raiz || [],
  );

  const [evidenciasSolucionImplementada, setEvidenciasSolucionImplementada] = useState<any[]>(
    pdcaInicial.evidenciasSolucion || pdcaInicial.evidencias_solucion || [],
  );
  const [pruebasEjecutadasFaseCheck, setPruebasEjecutadasFaseCheck] = useState<any[]>(
    pdcaInicial.pruebasEjecutadas || pdcaInicial.pruebas_ejecutadas || [],
  );

  const [archivosAnalisisEstadistico, setArchivosAnalisisEstadistico] = useState<string[]>(
    pdcaInicial.statisticalAnalysisFiles || [],
  );
  const [archivosInformacionAdicional, setArchivosInformacionAdicional] = useState<string[]>(
    pdcaInicial.informacionAdicionalFiles || pdcaInicial.informacion_adicional_files || [],
  );

  return {
    tablasCincoPorques,
    setTablasCincoPorques,
    matrizImpacto,
    setMatrizImpacto,
    ishikawasGenerales,
    setIshikawasGenerales,
    conceptosIshikawa,
    setConceptosIshikawa,
    elementosAccion,
    setElementosAccion,
    tieneCorrelacionSabor,
    setTieneCorrelacionSabor,
    datosCorrelacionSabor,
    setDatosCorrelacionSabor,
    tieneTemasGop,
    setTieneTemasGop,
    datosTemasGop,
    setDatosTemasGop,
    archivosMapeoProcesos,
    setArchivosMapeoProcesos,
    tieneMapeoProcesos,
    setTieneMapeoProcesos,
    imagenMapeoProceso,
    setImagenMapeoProceso,
    descripcionMapeoProceso,
    setDescripcionMapeoProceso,
    archivosMapaSipoc,
    setArchivosMapaSipoc,
    datosColeccion,
    setDatosColeccion,
    textoEspecificacionProcesos,
    setTextoEspecificacionProcesos,
    imagenEspecificacionProcesos,
    setImagenEspecificacionProcesos,
    datosVozConsumidor,
    setDatosVozConsumidor,
    riesgosProyectoAnalizados,
    setRiesgosProyectoAnalizados,
    riesgosEstandarizacionAnalizados,
    setRiesgosEstandarizacionAnalizados,
    conclusionesCausaRaizEncontradas,
    setConclusionesCausaRaizEncontradas,
    evidenciasSolucionImplementada,
    setEvidenciasSolucionImplementada,
    pruebasEjecutadasFaseCheck,
    setPruebasEjecutadasFaseCheck,
    archivosAnalisisEstadistico,
    setArchivosAnalisisEstadistico,
    archivosInformacionAdicional,
    setArchivosInformacionAdicional,
  };
};
