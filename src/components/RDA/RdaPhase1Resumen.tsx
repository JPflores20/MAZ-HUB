import React from "react";
import type { Rda } from "@/data/rda";
import { IshikawaInteractivo } from "@/components/pdca/1.PLAN/paso16/ishikawa-interactive";

interface Props {
  rda: Rda;
  onChange?: (rda: Rda) => void;
}

export function RdaPhase1Resumen({ rda }: Props) {
  // Helpers
  const concatenatedProblem = [
    rda.problemDescription?.que,
    rda.problemDescription?.como,
    rda.problemDescription?.cuando,
    rda.problemDescription?.donde,
    rda.problemDescription?.quien,
    rda.problemDescription?.cual,
  ]
    .filter(Boolean)
    .map((s) => s?.trim())
    .join(" ");

  const immediateActionText = rda.immediateActions?.[0]?.accion || "No definido";
  const observacionesText = rda.observacionesAdicionales || "No definido";

  // Ishikawa data
  const currentIshikawa = rda.ishikawa?.[0] || { effect: "", causes: {} };

  // Common classes for print-like tables
  const thClass = "border border-black/30 bg-[#0078D7] p-1.5 font-bold text-[10px] text-center text-white uppercase";
  const tdClass = "border border-black/30 p-1.5 text-xs text-center text-blue-800 font-medium bg-white";
  const headerDivClass = "bg-[#0078D7] border border-black/30 p-1.5 font-bold text-center text-xs uppercase text-white mt-6";
  const textDivClass = "border border-t-0 border-black/30 p-3 text-xs text-blue-800 text-center font-medium bg-white min-h-[40px]";

  return (
    <div className="bg-white p-4 sm:p-8 rounded-xl shadow-sm border border-border w-full overflow-x-auto text-black print:p-0 print:border-none print:shadow-none">
      
      
      <h1 className="text-xl font-bold tracking-wide uppercase text-center mb-4">Reporte de Anomalías</h1>

      {/* Context Table */}
      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr>
            <th className={thClass}>Planta</th>
            <th className={thClass}>Fecha de la anomalía</th>
            <th className={thClass}>Turno/Equipo</th>
            <th className={thClass}>Iniciado por:</th>
            <th className={thClass}>Responsable:</th>
            <th className={thClass}>Etapa</th>
          </tr>
          <tr>
            <td className={tdClass}>{rda.context.planta || "-"}</td>
            <td className={tdClass}>{rda.context.fecha || "-"}</td>
            <td className={tdClass}>{rda.context.turno || "-"}</td>
            <td className={tdClass}>{rda.context.iniciadoPor || "-"}</td>
            <td className={tdClass}>{rda.context.responsable || "-"}</td>
            <td className={tdClass}>{rda.context.etapa || "-"}</td>
          </tr>
          <tr>
            <th className={thClass}>Departamento</th>
            <th className={thClass}>Área</th>
            <th className={thClass}>Disparador</th>
            <th colSpan={2} className={thClass}>Equipo afectado:</th>
            <th className={thClass}>Folio RDA:</th>
          </tr>
          <tr>
            <td className={tdClass}>{rda.context.departamento || "-"}</td>
            <td className={tdClass}>{rda.context.area || "-"}</td>
            <td className={tdClass}>{rda.context.disparador || "-"}</td>
            <td colSpan={2} className={tdClass}>{rda.context.equiposAfectados || "-"}</td>
            <td className={tdClass}>{rda.context.folio || "-"}</td>
          </tr>
          <tr>
            <th className={thClass}>Tiempo de paro<br/>(números)</th>
            <th className={thClass}>Unidades<br/>(Tiempo de paro)</th>
            <th className={thClass}>Pérdidas/Desperdicios<br/>(números)</th>
            <th className={thClass}>Unidades<br/>(pérdidas)</th>
            <th className={thClass}>Productos no conformes<br/>(números)</th>
            <th className={thClass}>Unidades<br/>(producto no conforme)</th>
          </tr>
          <tr>
            <td className={tdClass}>{rda.context.tiempoParo || "-"}</td>
            <td className={tdClass}>{rda.context.unidadesTiempoParo || "-"}</td>
            <td className={tdClass}>{rda.context.perdidas || "-"}</td>
            <td className={tdClass}>{rda.context.unidadesPerdidas || "-"}</td>
            <td className={tdClass}>{rda.context.productosNoConformes || "-"}</td>
            <td className={tdClass}>{rda.context.unidadesNoConformes || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Descripcion */}
      <div className={headerDivClass}>Descripción de la anormalidad (¿Qué ocasionó la anormalidad?) - Resumen</div>
      <div className={textDivClass}>{concatenatedProblem || "-"}</div>

      {/* Acciones Correctivas */}
      <div className={headerDivClass}>Acciones correctivas inmediatas</div>
      <div className={textDivClass}>{immediateActionText}</div>

      {/* Observaciones */}
      <div className={headerDivClass}>Observaciones (Información adicional / Detalles)</div>
      <div className={textDivClass}>{observacionesText}</div>

      {/* Analisis de Causa Raiz Header */}
      <div className={headerDivClass}>Análisis de Causa Raíz - Completar dentro de los cinco días posteriores a la anomalía</div>
      <table className="w-full border-collapse mb-6">
        <tbody>
          <tr>
            <th className={`${thClass} border-t-0 w-[40%]`}>¿Se ha analizado esta anomalía en otros reportes?</th>
            <td className={`${tdClass} border-t-0 w-[10%]`}>{rda.analizadoEnOtrosReportes || "No"}</td>
            <th className={`${thClass} border-t-0 w-[20%]`}>Participantes:</th>
            <td className={`${tdClass} border-t-0 w-[30%]`}>{rda.participantesRC || "-"}</td>
          </tr>
        </tbody>
      </table>

      {/* Ishikawa */}
      <div className="mb-8 pointer-events-none border border-black/30 p-2">
        <IshikawaInteractivo
          tituloPersonalizado="Diagrama Causa - Efecto"
          causasRegistradas={currentIshikawa.causes || {}}
          alCambiarCausas={() => {}}
          efectoPrincipal={currentIshikawa.effect || ""}
          alCambiarEfecto={() => {}}
        />
      </div>

      

      {/* Validacion de causa raiz */}
      <div className={headerDivClass}>Acciones de validación de causa raíz</div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className={thClass}>#</th>
            <th className={thClass}>Categoría</th>
            <th className={thClass}>Causa Potencial</th>
            <th className={thClass}>Acción</th>
            <th className={thClass}>Responsable</th>
            <th className={thClass}>Fecha Límite</th>
            <th className={thClass}>Estatus</th>
            <th className={thClass}>¿Posible causa raíz?</th>
          </tr>
        </thead>
        <tbody>
          {rda.validationActions?.map((val, idx) => (
            <tr key={val.id}>
              <td className={tdClass}>{idx + 1}</td>
              <td className={tdClass}>{val.categoria}</td>
              <td className={tdClass}>{val.causaPotencial}</td>
              <td className={tdClass}>{val.accion}</td>
              <td className={tdClass}>{val.responsable}</td>
              <td className={tdClass}>{val.fechaLimite}</td>
              <td className={`${tdClass} ${val.estatus === 'Completado' ? 'bg-green-400 text-black' : ''}`}>{val.estatus}</td>
              <td className={tdClass}>{val.esCausaRaiz}</td>
            </tr>
          ))}
          {(!rda.validationActions || rda.validationActions.length === 0) && (
            <tr><td colSpan={8} className={`${tdClass} text-muted-foreground`}>Sin acciones de validación</td></tr>
          )}
        </tbody>
      </table>

      {/* Estandarizacion */}
      <div className={headerDivClass}>Checklist de estandarización y gestión del conocimiento - Se incluyó la solución a la rutina</div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th colSpan={2} className={thClass}>Evaluación de estándares</th>
            <th colSpan={2} className={thClass}>Herramientas VPO para considerar en el seguimeinto</th>
          </tr>
        </thead>
        <tbody>
          {[
            { id1: "mapeo", q1: "¿Se requiere actualizar el Mapeo de Procesos? (En caso afirmativo, agregar acción de crear/actualizar mapeo)", id2: "chk_checklist", q2: "Actualización de Checklist" },
            { id1: "owd", q1: "¿Es necesario realizar una OWD para verificar el seguimiento del SOP? (En caso afirmativo, agregar acción de realizar OWD)", id2: "chk_pisic", q2: "Monitoreo de PI/SIC" },
            { id1: "sop", q1: "¿Se necesita actualizar el SOP? (En caso afirmativo, agregar acción de crear/actualizar SOP)", id2: "chk_sap", q2: "Investigación SAP del equipo" },
            { id1: "capacitacion", q1: "¿Existen cambios o es necesaria capacitación en el SOP? (En caso afirmativo, agregar acción de creación de OPL y entrenamiento)", id2: "chk_sla", q2: "Creación de SLA" },
            { id1: "monitoreo_ip", q1: "¿Es necesario agregar a la rutina el monitoreo del IP? (En caso afirmativo, agregar acción de monitoreo de IP)", id2: "chk_gops", q2: "Revisión de GOPs existentes" }
          ].map((row, i) => (
            <tr key={i}>
              <td className={`border border-black/30 p-1.5 text-center font-bold text-white w-[60px] ${rda.checklistEstandarizacion?.[row.id1] ? "bg-[#00B050]" : "bg-red-500"}`}>{rda.checklistEstandarizacion?.[row.id1] ? "Sí" : "No"}</td>
              <td className="border border-black/30 p-1.5 text-xs text-left text-blue-800 bg-white font-medium">{row.q1}</td>
              <td className={`border border-black/30 p-1.5 text-center font-bold text-white w-[60px] ${rda.checklistEstandarizacion?.[row.id2] ? "bg-[#00B050]" : "bg-red-500"}`}>{rda.checklistEstandarizacion?.[row.id2] ? "Sí" : "No"}</td>
              <td className="border border-black/30 p-1.5 text-xs text-left text-blue-800 bg-white font-medium">{row.q2}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* PDA */}
      <div className={headerDivClass}>PREVENCIÓN - PDA (Eliminación de causa raíz y acciones de actualización de rutina)</div>
      <table className="w-full border-collapse mb-6">
        <thead>
          <tr>
            <th className={thClass}>#</th>
            <th className={thClass}>Fecha</th>
            <th className={thClass}>Asunto</th>
            <th className={thClass}>Acción</th>
            <th className={thClass}>Comentarios</th>
            <th className={thClass}>Responsable</th>
            <th className={thClass}>Fecha Límite</th>
            <th className={thClass}>Estatus</th>
          </tr>
        </thead>
        <tbody>
          {rda.pda?.map((action, idx) => (
            <tr key={action.id}>
              <td className={tdClass}>{idx + 1}</td>
              <td className={tdClass}>{action.fecha || "-"}</td>
              <td className={tdClass}>{action.asunto || "-"}</td>
              <td className={tdClass}>{action.accion || "-"}</td>
              <td className={tdClass}>{action.comentarios || "-"}</td>
              <td className={tdClass}>{action.responsable || "-"}</td>
              <td className={tdClass}>{action.fechaLimite || "-"}</td>
              <td className={`${tdClass} ${action.estatus === 'Complete' ? 'bg-green-400 text-black' : action.estatus === 'In Progress' ? 'bg-yellow-200 text-black' : ''}`}>{action.estatus || "-"}</td>
            </tr>
          ))}
          {(!rda.pda || rda.pda.length === 0) && (
            <tr><td colSpan={8} className={`${tdClass} text-muted-foreground`}>Sin acciones PDA</td></tr>
          )}
        </tbody>
      </table>

    </div>
  );
}
