const fs = require("fs");
const path = require("path");

const rdaDir = path.join(
  "c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/components/RDA",
);
const files = fs.readdirSync(rdaDir).filter((f) => f.endsWith(".tsx"));

const dict = {
  "1. Resumen": "rda.phase1Summary",
  "2. Descripción del Problema": "rda.phase2ProblemDesc",
  "3. Análisis de Causas Raíz": "rda.phase3RootCause",
  "4. Evaluación de Calidad RDA": "rda.phase4QualityEval",
  "5. Evaluación de Efectividad de RDA": "rda.phase5EffectivenessEval",
  "Volver a Mis RDAs": "rda.backToMyRdas",
  "Nuevo RDA": "rda.newRda",
  "ESTATUS:": "rda.statusLabel",
  "Guardando...": "rda.saving",
  Sincronizado: "rda.synchronized",
  "Guardar RDA": "rda.saveRda",
  "Progreso del RDA:": "rda.rdaProgress",
  pasos: "rda.steps",
  "Reporte de Anomalías": "rda.anomalyReport",
  Planta: "rda.plant",
  "Fecha de la anomalía": "rda.anomalyDate",
  "Turno/Equipo": "rda.shiftTeam",
  "Iniciado por:": "rda.initiatedBy",
  "Responsable:": "rda.responsible",
  Etapa: "rda.stage",
  Departamento: "rda.department",
  Área: "rda.area",
  Disparador: "rda.trigger",
  "Equipo afectado:": "rda.affectedEquipment",
  "Folio RDA:": "rda.rdaFolio",
  "Tiempo de paro": "rda.downtime",
  "(números)": "rda.numbers",
  Unidades: "rda.units",
  "(Tiempo de paro)": "rda.downtimeUnits",
  "Pérdidas/Desperdicios": "rda.lossesWaste",
  "(pérdidas)": "rda.losses",
  "Productos no conformes": "rda.nonConformingProducts",
  "(producto no conforme)": "rda.nonConforming",
  "Descripción de la anormalidad (¿Qué ocasionó la anormalidad?) - Resumen":
    "rda.abnormalityDescriptionSummary",
  "Acciones correctivas inmediatas": "rda.immediateCorrectiveActions",
  "Observaciones (Información adicional / Detalles)": "rda.observationsDetails",
  "Análisis de Causa Raíz - Completar dentro de los cinco días posteriores a la anomalía":
    "rda.rootCauseAnalysisWarning",
  "¿Se ha analizado esta anomalía en otros reportes?": "rda.analyzedInOtherReports",
  "Participantes:": "rda.participants",
  "Acciones de validación de causa raíz": "rda.rootCauseValidationActions",
  Categoría: "rda.category",
  "Causa Potencial": "rda.potentialCause",
  Acción: "rda.action",
  "Fecha Límite": "rda.deadline",
  Estatus: "rda.status",
  "¿Posible causa raíz?": "rda.possibleRootCause",
  "Sin acciones de validación": "rda.noValidationActions",
  "Checklist de estandarización y gestión del conocimiento - Se incluyó la solución a la rutina":
    "rda.standardizationChecklist",
  "Evaluación de estándares": "rda.standardsEvaluation",
  "Herramientas VPO para considerar en el seguimeinto": "rda.vpoToolsToConsider",
  "PREVENCIÓN - PDA (Eliminación de causa raíz y acciones de actualización de rutina)":
    "rda.preventionPda",
  Fecha: "rda.date",
  Asunto: "rda.subject",
  Comentarios: "rda.comments",
  "Sin acciones PDA": "rda.noPdaActions",
};

const enDict = {
  phase1Summary: "1. Summary",
  phase2ProblemDesc: "2. Problem Description",
  phase3RootCause: "3. Root Cause Analysis",
  phase4QualityEval: "4. RDA Quality Evaluation",
  phase5EffectivenessEval: "5. RDA Effectiveness Evaluation",
  backToMyRdas: "Back to My RDAs",
  newRda: "New RDA",
  statusLabel: "STATUS:",
  saving: "Saving...",
  synchronized: "Synchronized",
  saveRda: "Save RDA",
  rdaProgress: "RDA Progress:",
  steps: "steps",
  anomalyReport: "Anomaly Report",
  plant: "Plant",
  anomalyDate: "Anomaly Date",
  shiftTeam: "Shift/Team",
  initiatedBy: "Initiated by:",
  responsible: "Responsible:",
  stage: "Stage",
  department: "Department",
  area: "Area",
  trigger: "Trigger",
  affectedEquipment: "Affected Equipment:",
  rdaFolio: "RDA Folio:",
  downtime: "Downtime",
  numbers: "(numbers)",
  units: "Units",
  downtimeUnits: "(Downtime)",
  lossesWaste: "Losses/Waste",
  losses: "(losses)",
  nonConformingProducts: "Non-conforming Products",
  nonConforming: "(non-conforming)",
  abnormalityDescriptionSummary: "Abnormality Description (What caused the abnormality?) - Summary",
  immediateCorrectiveActions: "Immediate Corrective Actions",
  observationsDetails: "Observations (Additional Info / Details)",
  rootCauseAnalysisWarning: "Root Cause Analysis - Complete within five days after the anomaly",
  analyzedInOtherReports: "Has this anomaly been analyzed in other reports?",
  participants: "Participants:",
  rootCauseValidationActions: "Root Cause Validation Actions",
  category: "Category",
  potentialCause: "Potential Cause",
  action: "Action",
  deadline: "Deadline",
  status: "Status",
  possibleRootCause: "Possible root cause?",
  noValidationActions: "No validation actions",
  standardizationChecklist:
    "Standardization Checklist and Knowledge Management - Solution included in routine",
  standardsEvaluation: "Standards Evaluation",
  vpoToolsToConsider: "VPO Tools to consider in follow-up",
  preventionPda: "PREVENTION - PDA (Root cause elimination and routine update actions)",
  date: "Date",
  subject: "Subject",
  comments: "Comments",
  noPdaActions: "No PDA actions",
};

const esDict = {
  phase1Summary: "1. Resumen",
  phase2ProblemDesc: "2. Descripción del Problema",
  phase3RootCause: "3. Análisis de Causas Raíz",
  phase4QualityEval: "4. Evaluación de Calidad RDA",
  phase5EffectivenessEval: "5. Evaluación de Efectividad de RDA",
  backToMyRdas: "Volver a Mis RDAs",
  newRda: "Nuevo RDA",
  statusLabel: "ESTATUS:",
  saving: "Guardando...",
  synchronized: "Sincronizado",
  saveRda: "Guardar RDA",
  rdaProgress: "Progreso del RDA:",
  steps: "pasos",
  anomalyReport: "Reporte de Anomalías",
  plant: "Planta",
  anomalyDate: "Fecha de la anomalía",
  shiftTeam: "Turno/Equipo",
  initiatedBy: "Iniciado por:",
  responsible: "Responsable:",
  stage: "Etapa",
  department: "Departamento",
  area: "Área",
  trigger: "Disparador",
  affectedEquipment: "Equipo afectado:",
  rdaFolio: "Folio RDA:",
  downtime: "Tiempo de paro",
  numbers: "(números)",
  units: "Unidades",
  downtimeUnits: "(Tiempo de paro)",
  lossesWaste: "Pérdidas/Desperdicios",
  losses: "(pérdidas)",
  nonConformingProducts: "Productos no conformes",
  nonConforming: "(producto no conforme)",
  abnormalityDescriptionSummary:
    "Descripción de la anormalidad (¿Qué ocasionó la anormalidad?) - Resumen",
  immediateCorrectiveActions: "Acciones correctivas inmediatas",
  observationsDetails: "Observaciones (Información adicional / Detalles)",
  rootCauseAnalysisWarning:
    "Análisis de Causa Raíz - Completar dentro de los cinco días posteriores a la anomalía",
  analyzedInOtherReports: "¿Se ha analizado esta anomalía en otros reportes?",
  participants: "Participantes:",
  rootCauseValidationActions: "Acciones de validación de causa raíz",
  category: "Categoría",
  potentialCause: "Causa Potencial",
  action: "Acción",
  deadline: "Fecha Límite",
  status: "Estatus",
  possibleRootCause: "¿Posible causa raíz?",
  noValidationActions: "Sin acciones de validación",
  standardizationChecklist:
    "Checklist de estandarización y gestión del conocimiento - Se incluyó la solución a la rutina",
  standardsEvaluation: "Evaluación de estándares",
  vpoToolsToConsider: "Herramientas VPO para considerar en el seguimeinto",
  preventionPda:
    "PREVENCIÓN - PDA (Eliminación de causa raíz y acciones de actualización de rutina)",
  date: "Fecha",
  subject: "Asunto",
  comments: "Comentarios",
  noPdaActions: "Sin acciones PDA",
};

const i18nPath = path.join("c:/Users/pepej/Documents/CORONA/REPOS/MAZ HUB/MAZ-HUB/src/lib/i18n.ts");
let i18nContent = fs.readFileSync(i18nPath, "utf8");

const enRda = `\n      rda: ${JSON.stringify(enDict, null, 8).replace(/}$/, "      },")}`;
if (!i18nContent.includes("rda: {")) {
  i18nContent = i18nContent.replace(
    /en:\s*{\s*translation:\s*{/,
    `en: {\n    translation: {${enRda}`,
  );
}

const esRda = `\n      rda: ${JSON.stringify(esDict, null, 8).replace(/}$/, "      },")}`;
if (!i18nContent.includes("phase1Summary")) {
  i18nContent = i18nContent.replace(
    /es:\s*{\s*translation:\s*{/,
    `es: {\n    translation: {${esRda}`,
  );
}

fs.writeFileSync(i18nPath, i18nContent);

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\\\$&");
}

files.forEach((f) => {
  const filePath = path.join(rdaDir, f);
  let content = fs.readFileSync(filePath, "utf8");
  let originalContent = content;

  if (!content.includes("useTranslation") && Object.keys(dict).some((k) => content.includes(k))) {
    content = 'import { useTranslation } from "react-i18next";\n' + content;
  }

  if (content.includes("useTranslation") && !content.includes("const { t } = useTranslation();")) {
    content = content.replace(
      /(export function [a-zA-Z0-9_]+\s*\([^)]*\)\s*{)/,
      `$1\n  const { t } = useTranslation();\n`,
    );
  }

  for (const [esText, key] of Object.entries(dict)) {
    const escapedText = escapeRegExp(esText);
    const jsxRegex = new RegExp(`>([^<]*)${escapedText}([^<]*)<`, "g");
    content = content.replace(jsxRegex, (match, p1, p2) => {
      if (p1.trim() === "" && p2.trim() === "") return `>{t("${key}")}<`;
      return match;
    });

    const quoteRegex1 = new RegExp(`"${escapedText}"`, "g");
    if (quoteRegex1.test(content)) {
      content = content.replace(quoteRegex1, `t("${key}")`);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
  }
});
console.log("Done");
